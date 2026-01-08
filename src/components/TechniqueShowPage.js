// // Show an individual technique here, including its video, and allow for an edit function (visible to admins only)
// // Work in progress

import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useHistory } from "react-router-dom"; 
import { Technique, Belt, Video, TechniqueType, Difference } from "../requests"; 
import moment from "moment";
import { getCountryAdjective } from "../utils/countryHelpers";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import "../App.scss"; 

// --- Helper Functions (Re-used for consistency with SyllabusShowPage) ---

// NOTE: Pastel colours probably won't be used, as previously noted on SyllabusShowPage, so users can more readily identify them with real-life belt colours
function getPastelBeltColor(rawColor) {
  if (!rawColor) return '#E0E0E0';
  const cleanColor = rawColor.replace(/ +/g, "").toLowerCase();
  
  const colorMap = {
    // Soft Pastel Shades for Visual Consistency
    orange: '#FFDCB3', 
    green: '#D1EAD1',  
    purple: '#D8BFD8', 
    yellow: '#FFFFB3', 
    blue: '#B3E5FF',   
    brown: '#E6C6B3',  
    red: '#FFC0C0',    
    black: '#C0C0C0',  
  };

  return colorMap[cleanColor] || '#E0E0E0'; // Fallback to light gray
}

const finishKyuNumber = function (integer) {
  // Ensure the input is an integer
  const num = parseInt(integer, 10); 
  if (isNaN(num)) return "";

  if (num === 1) {
    return "st";
  } else if (num === 2) {
    return "nd";
  } else if (num === 3) {
    return "rd";
  } else {
    return "th";
  }
};

function urlHandler(url) {
  if (!url) return "";
  let watch = "watch?v=";
  let extendedUrl = "https://www.youtube.com/embed/";
  let shortenedUrl = "https://youtu.be/";
  let identifier = ""; 

  // 1. Handle full YouTube URLs with 'watch?v='
  if (url.includes(watch)) {
    const urlParams = new URLSearchParams(url.substring(url.indexOf("?") + 1));
    identifier = urlParams.get("v");
    
    if (identifier) {
        return `${extendedUrl}${identifier}`;
    }
  } 
  
  // 2. Handle shortened URLs (https://youtu.be/ID)
  else if (url.includes(shortenedUrl)) {
    identifier = url.replace(shortenedUrl, "").split(/[?&]/)[0];
    if (identifier) {
        return `${extendedUrl}${identifier}`;
    }
  } 
  
  // 3. Default (Assume it's already an embeddable URL)
  return url.includes(extendedUrl) ? url : url;
}


// --- Main Functional Component ---
export default function TechniqueShowPage() {
  const { id } = useParams(); // Get the technique ID from the URL params
  const history = useHistory(); 
  
  // State for data
  const [technique, setTechnique] = useState(null);
  const [techniqueType, setTechniqueType] = useState(null);
  const [belt, setBelt] = useState(null);
  const [videos, setVideos] = useState([]); // Array of video objects
  // NEW STATE: Differences (comparisons to other techniques)
  const [differences, setDifferences] = useState([]); 
  
  // State for UI management
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get current user and admin status from Redux
  const currentUser = useSelector((state) => state.user.user) || {};
  const isAdmin = currentUser.is_admin || false;

  // --- Data Fetching (useEffect replacement for componentDidMount) ---
  const fetchData = useCallback(async () => {
    console.log("[DEBUG] Starting fetch for Technique ID:", id);

    if (!id) {
      setError("No Technique ID provided.");
      setIsLoading(false);
      return;
    }

    try {
      // 1. Fetch the main technique resource (we assume this includes related data like differences via JSON:API)
      const techniqueResponse = await Technique.one(id);

      if (!techniqueResponse || techniqueResponse.errors) {
        throw new Error("Technique not found or API error on main technique fetch.");
      }

      const techniqueData = techniqueResponse.data || {};
      const relationships = techniqueData.relationships || {};
      // Note: We ignore 'included' for differences since the primary fetch failed to sideload them reliably

      // 2. Extract IDs and Relationships
      const beltId = relationships.belt?.data?.id || techniqueData.attributes?.belt_id;
      const techniqueTypeId = relationships.technique_type?.data?.id || techniqueData.attributes?.technique_type_id;
      const techniqueAttributes = techniqueData.attributes || {};
      const videoRelationships = relationships.videos?.data || [];
      const videoIds = videoRelationships.map(v => v.id);

      // Extract ALL Difference IDs (outbound 'differences' and inbound 'comparisons')
      // This is crucial for bidirectionality: we look at both relationships
      const outboundDifferences = relationships.differences?.data || [];
      const inboundComparisons = relationships.comparisons?.data || [];
      const allDifferenceRelationships = [...outboundDifferences, ...inboundComparisons];

      // Ensure unique IDs
      const uniqueDifferenceIds = [...new Set(allDifferenceRelationships.map(d => d.id))];

      console.log("[DEBUG] Extracted Belt ID:", beltId);
      console.log("[DEBUG] Extracted Technique Type ID:", techniqueTypeId);
      console.log("[DEBUG] Found Difference IDs:", uniqueDifferenceIds);

      // 3. Concurrently fetch related resources
      const [beltResponse, techniqueTypeResponse] = await Promise.all([
        beltId ? Belt.find(beltId) : Promise.resolve(null),
        techniqueTypeId ? TechniqueType.get(techniqueTypeId) : Promise.resolve(null),
      ]);

      console.log("[DEBUG] Belt Response Received:", beltResponse);
      console.log("[DEBUG] Technique Type Response Received:", techniqueTypeResponse);

      // 4. Normalize the responses (flatten JSON:API structure to plain objects)
      const flatTechnique = {
        id: techniqueData.id,
        ...techniqueAttributes,
        videourls: videoIds,
      }

      const flatBelt = beltResponse?.data?.attributes || flatTechnique.belt;
      const flatTechniqueType = techniqueTypeResponse?.data?.attributes || flatTechnique.technique_type;

      // Explicitly fetch the content for all difference records.
      // Request nested sideloading for BOTH technique relationships 
      // ('technique' and 'compared_to_technique') to support bidirectional comparison lookups.
      const differenceResponses = await Promise.all(
          uniqueDifferenceIds.map(diffId => 
              Difference.get(diffId, "technique.belt.syllabus,compared_to_technique.belt.syllabus") 
          )
      );

      console.log("[DEBUG] Raw Difference Responses:", differenceResponses.filter(res => res && res.data));
      
      const currentTechniqueId = id; // ID of the technique page we are viewing

      const flatDifferences = differenceResponses
          .filter(res => res && res.data) // Filter out null or failed responses
          .map((res, index) => {
              const diffData = res.data;
              const diffAttributes = diffData.attributes;
              
              const primaryTechniqueId = diffData.relationships?.technique?.data?.id;
              const reciprocalTechniqueId = diffData.relationships?.compared_to_technique?.data?.id;
              
              const includedResources = res.included || [];

              // --- START: Role Reversal Logic for Bidirectionality ---
              
              // Determine the ID of the technique we should display/link to (the *other* one)
              const comparisonTargetId = (currentTechniqueId === primaryTechniqueId)
                  ? reciprocalTechniqueId // Viewing primary side, target is reciprocal side
                  : primaryTechniqueId; // Viewing reciprocal side, target is primary side (INVERSION)

              // Find the corresponding technique resource in the included array
              // This should now succeed because we included both relationships in the API call above.
              const targetTechniqueResource = includedResources.find(
                  inc => inc.type === 'techniques' && inc.id === comparisonTargetId
              );
              
              let comparisonText = `Technique ID ${comparisonTargetId}`; // Default fallback

              if (targetTechniqueResource) {
                const targetBeltId = targetTechniqueResource.relationships?.belt?.data?.id;

                // The summary of the technique we are linking to
                const targetSummary = targetTechniqueResource.attributes?.summary || `Technique ID ${comparisonTargetId}`;

                // Find the belt resource
                const targetBeltResource = includedResources.find(
                    inc => inc.type === 'belts' && inc.id === targetBeltId
                );

                let syllabusYear = 'Unknown Year';
                let countryName = 'Unknown Country';

                if (targetBeltResource) {
                    const syllabusIdFromRelationships = targetBeltResource.relationships?.syllabus?.data?.id;
                    const syllabusIdFromAttributes = targetBeltResource.attributes?.syllabus_id?.toString();
                    const syllabusId = syllabusIdFromRelationships || syllabusIdFromAttributes;

                    // Find the Syllabus Resource in the included array
                    const syllabusResource = includedResources.find(
                        inc => inc.type === 'syllabi' && inc.id === syllabusId
                    );

                    if (syllabusResource) {
                        // 4. Extract attributes from the Syllabus Resource
                        const syllabusAttributes = syllabusResource.attributes;
                        syllabusYear = syllabusAttributes.year || 'Unknown Year';
                        countryName = getCountryAdjective(syllabusAttributes.country) || 'Unknown Country';

                        // CONSTRUCT THE DESIRED STRING:
                        // (Summary), from Syllabus (Year) (Country Name)
                        comparisonText = `${targetSummary}, from the ${syllabusYear} ${countryName} Syllabus.`;
                    } else {
                        comparisonText = `${targetSummary} (Syllabus details unavailable)`;
                        console.log(`[DEBUG - Diff ${index}] Fallback: Syllabus resource not found or null.`);
                    }
                } else {
                    comparisonText = `${targetSummary} (Syllabus details unavailable - Belt not found)`;
                    console.log(`[DEBUG - Diff ${index}] Fallback: Target Belt resource not found or null.`);
                }
              } else {
                  comparisonText = `${comparisonText} (Comparison technique details unavailable)`;
                  console.log(`[DEBUG - Diff ${index}] Fallback: Target Technique resource not found or null. This error indicates the API failed to sideload the related technique data.`);
              }
              // --- END: Role Reversal Logic for Bidirectionality ---

              return {
                  id: diffData.id,
                  content: diffAttributes.content,
                  comparedToTechniqueSummary: comparisonText, // Use the new formatted string
                  // NEW: Include the correct target ID for navigation
                  comparedToTechniqueId: comparisonTargetId,
              };
          });

      console.log("[DEBUG] Normalized Differences (After Explicit GET):", flatDifferences);

      // 5. Fetch and flatten Video data
      const videoResponses = await Promise.all(
          videoIds.map(videoId => Video.find(videoId))
      );

      const flatVideos = videoResponses
          .filter(v => v && v.data) // Filter out null or failed responses
          .map(v => ({ id: v.data.id, ...v.data.attributes })); // Flatten video data

      // 6. Update state
      setTechnique(flatTechnique);
      setBelt(flatBelt);
      setTechniqueType(flatTechniqueType);
      setVideos(flatVideos);
      setDifferences(flatDifferences); // Save the differences

      console.log("[DEBUG] All critical resources successfully loaded and normalized.");

    } catch (err) {
      console.error("[Data Fetch Error]:", err);
      setError("Failed to load technique details or related resources. Check console for details.");
    } finally {
      setIsLoading(false);
      console.log("[DEBUG] TechniqueShowPage fetch process complete.");
    }
  }, [id]); // id is a dependency


  useEffect(() => {
    window.scrollTo(0, 0); 
    fetchData();
  }, [fetchData]);


  // --- CRUD Actions ---

  const deleteTechnique = useCallback(async () => {
    // IMPORTANT: Use custom modal UI instead of window.confirm in a real app
    // Note: Leaving window.confirm for now as it was in the original context, but generally discouraged.
    if (window.confirm("Are you sure you want to delete this technique?")) {
        const data = await Technique.destroy(id);
        if (data.status === 200 || !data.errors) {
            history.push("/syllabus"); // USING history.push() for v5 navigation
        } else {
            setError("Cannot delete technique.");
        }
    }
  }, [id, history]);
  
  const updateVideo = useCallback(async (videoId, countryKey) => {
      // IMPORTANT: Use custom modal UI instead of window.confirm in a real app
      if (!window.confirm(`Are you sure you want to remove the ${countryKey.replace('_version', '')} video link?`)) return;

      const videoToUpdate = videos.find(v => v.id === videoId);
      
      if (!videoToUpdate) return;
      
      const updatedVideoData = {
          ...videoToUpdate,
          [countryKey]: null, // Clear the specific country field
      };
      
      try {
          await Video.update(videoId, updatedVideoData); 
          
          setVideos(prevVideos => prevVideos.map(v => 
              v.id === videoId ? updatedVideoData : v
          ));
      } catch (err) {
          console.error("Failed to update video URL:", err);
          setError("Failed to delete video URL on server.");
      }
      
  }, [videos]);

  const deleteVideoRecord = useCallback(async (videoId) => {
    // IMPORTANT: Use custom modal UI instead of window.confirm in a real app
    if (window.confirm("Are you sure you want to delete this entire video record (both country links)?")) {
        const data = await Video.destroy(videoId);
        if (data.status === 200 || !data.errors) {
            setVideos(prevVideos => prevVideos.filter((videoItem) => videoItem.id !== videoId));
        } else {
            setError("Cannot delete video record.");
        }
    }
  }, []);
  
  // --- Render Handlers ---

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-xl font-medium text-gray-600">Loading Technique...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-lg shadow-md">
          <h3 className="font-bold text-lg">Error Loading Data</h3>
          <p>{error}</p>
          <Link to="/syllabus" className="text-blue-500 hover://underline mt-2 inline-block">Go back to Syllabus</Link>
        </div>
      </div>
    );
  }
  
  // Check that all required objects have loaded and have the necessary properties
  if (!technique || !belt || !belt.kyu_number || !belt.colour || !techniqueType || !techniqueType.category) {
      console.warn("[Render Error] Missing critical data after fetch. Technique:", technique, "Belt:", belt, "TechniqueType:", techniqueType);
      
      if (belt && belt.kyu_number && belt.colour) {
          return (
             <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
                 <div className="bg-white p-6 rounded-lg shadow-md text-gray-700">
                     <h3 className="font-bold text-xl">Incomplete Technique Data</h3>
                     <p className="mt-2 text-red-600">Error: Could not retrieve Technique Type or Technique details.</p>
                     <p className="mt-4">However, the Belt data for **{belt.colour} {belt.kyu_number}{finishKyuNumber(belt.kyu_number)} Kyu** was loaded correctly.</p>
                     <Link to="/syllabus" className="text-blue-500 hover://underline mt-4 inline-block">View Syllabus</Link>
                 </div>
             </div>
          );
      }
      
      return (
          <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
              <div className="bg-white p-6 rounded-lg shadow-md text-gray-700">
                  <h3 className="font-bold text-xl">Incomplete Technique Data</h3>
                  <p className="mt-2">The technique was loaded, but crucial details are missing. Check console for full object structures.</p>
                  <Link to="/syllabus" className="text-blue-500 hover://underline mt-4 inline-block">View Syllabus</Link>
              </div>
          </div>
      );
  }
  
  const beltTitle = `${belt.kyu_number}${finishKyuNumber(belt.kyu_number)} Kyu (${belt.colour})`;


  // --- JSX Rendering ---
  return (
    <main className="TechniqueShowPage min-h-screen bg-gray-100">

      {/* Full-Width Belt Header (using pastel color) */}
      <div 
        className="w-full shadow-lg"
        style={{
          backgroundColor: belt.colour.replace(/ +/g, ""),
          // backgroundColor: getPastelBeltColor(belt.colour),
        }}
      >
        <div className="max-w-4xl mx-auto p-4 text-center">
            <h1
                className="text-xl md:text-2xl font-bold text-black"
                style={{
                    textDecorationLine: "underline",
                    textDecorationSkipInk: "none",
                }}
            >
                {beltTitle}
            </h1>
        </div>
      </div>

      <div className="central max-w-4xl mx-auto p-4 md:p-8">

        {/* Technique Title & Category */}
        <div className="mb-8 p-4 bg-white rounded-lg shadow-md border-t-4 border-gray-300">
            <p className="text-sm font-semibold text-gray-500 mb-1">Category/waza:</p>
            <h3 className="text-lg font-serif italic text-gray-700">
                {techniqueType.category}
            </h3>
            <h2 className="text-3xl font-extrabold text-gray-900 mt-2">
                {technique.summary}
            </h2>
            <p className="text-lg font-medium text-gray-600 mt-1">
                <p className="text-sm font-semibold text-gray-500 mb-1">Subcategory:</p>
                {techniqueType.sub_category}
            </p>
        </div>

        {/* Syllabus Differences Section (NEW LOGIC) */}
        {differences.length > 0 && (
            <div className="mb-8 p-4 bg-yellow-100 border-l-4 border-yellow-500 rounded-lg shadow-sm">
                <h4 className="font-bold text-yellow-800 text-xl mb-3">
                    Syllabus Comparison Notes
                </h4>
                {differences.map((diff, index) => (
                    <div key={diff.id || index} className="mb-4 last:mb-0 border-b border-yellow-200 last:border-b-0 pb-3">
                        <p className="font-semibold text-yellow-900 mb-1">
                            Compared to:                             {/* START: Link Implementation */}
                            {diff.comparedToTechniqueId ? (
                                <Link 
                                    to={`/techniques/${diff.comparedToTechniqueId}`} 
                                    className="ml-1 text-blue-700 hover:text-blue-900 hover:underline"
                                >
                                    {diff.comparedToTechniqueSummary || "Unknown Technique"}
                                </Link>
                            ) : (
                                <span className="ml-1">{diff.comparedToTechniqueSummary || "Unknown Technique"}</span>
                            )}
                            {/* END: Link Implementation */}
                        </p>
                        <p className="text-yellow-700 whitespace-pre-wrap">{diff.content}</p>
                    </div>
                ))}
            </div>
        )}

        {/* Video Section */}
        {videos.length > 0 && (
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-700 mb-4 border-b pb-2">Demonstrations</h3>
                
                {videos.map((video, index) => {
                    const hasCanadian = !!video.canadian_version;
                    const hasUK = !!video.uk_version;
                    
                    // Only render the container if there is at least one video
                    if (!hasCanadian && !hasUK) return null; 

                    return (
                        <div key={video.id || index} className="bg-white p-4 rounded-lg shadow-md mb-6">
                            
                            {/* Admin-only: Delete Video Record button for the row */}
                            {isAdmin && (
                                <div className="mb-3 flex justify-end">
                                    <Button
                                        variant="outline-danger"
                                        size="sm"
                                        onClick={() => deleteVideoRecord(video.id)}
                                        className="text-xs"
                                    >
                                        Delete Both Videos in This Row
                                    </Button>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                
                                {/* Canadian Version */}
                                {hasCanadian && (
                                    <div className="flex flex-col">
                                        <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-inner">
                                            <iframe
                                                className="absolute top-0 left-0 w-full h-full"
                                                src={urlHandler(video.canadian_version)}
                                                frameBorder="0"
                                                allow="autoplay; encrypted-media; picture-in-picture"
                                                allowFullScreen
                                                title={`Canadian Version of ${technique.summary}`}
                                            />
                                        </div>
                                        <div className="mt-2 text-center text-gray-700 font-semibold">Canadian Version</div>
                                        
                                        {isAdmin && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => updateVideo(video.id, "canadian_version")}
                                                className="mt-2 mx-auto"
                                            >
                                                Delete Canadian Video Link
                                            </Button>
                                        )}
                                    </div>
                                )}
                                
                                {/* British Version */}
                                {hasUK && (
                                    <div className="flex flex-col">
                                        <div className="relative aspect-video bg-gray-200 rounded-lg overflow-hidden shadow-inner">
                                            <iframe
                                                className="absolute top-0 left-0 w-full h-full"
                                                src={urlHandler(video.uk_version)}
                                                frameBorder="0"
                                                allow="autoplay; encrypted-media; picture-in-picture"
                                                allowFullScreen
                                                title={`British Version of ${technique.summary}`}
                                            />
                                        </div>
                                        <div className="mt-2 text-center text-gray-700 font-semibold">British Version</div>
                                        
                                        {isAdmin && (
                                            <Button
                                                variant="danger"
                                                size="sm"
                                                onClick={() => updateVideo(video.id, "uk_version")}
                                                className="mt-2 mx-auto"
                                            >
                                                Delete UK Video Link
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}

        {/* Admin Controls */}
        {isAdmin && (
            <div className="mt-10 pt-4 border-t border-gray-300">
                {technique.created_at && (
                    <p className="text-sm text-gray-500 mb-4">
                        Posted on {moment(technique.created_at).format("MMM Do, YYYY")}
                    </p>
                )}

                <div className="flex space-x-4">
                    <Link to={`/techniques/${id}/edit`}>
                        <Button 
                            variant="success" 
                            className="shadow-md hover:shadow-lg transition-shadow"
                        >
                            Edit Technique
                        </Button>
                    </Link>

                    <Button
                        variant="danger"
                        onClick={deleteTechnique}
                        className="shadow-md hover:shadow-lg transition-shadow"
                    >
                        Delete Technique
                    </Button>
                </div>
            </div>
        )}
      </div>
    </main>
  );
}
