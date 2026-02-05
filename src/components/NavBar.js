import React, { useCallback, useMemo } from "react";
import tuff_logo from "../img/tuff-city-logo-no-background.png";
import { getCountryAdjective } from "../utils/countryHelpers";

function NavBar(props) {
  const { currentUser, onSignOut, primarySyllabus } = props;
  console.log("NavBar primarySyllabus:", primarySyllabus);

  const handleSignOutClick = useCallback(
    (event) => {
      event.preventDefault();
      if (typeof onSignOut === "function") {
        onSignOut();
      }
    },
    [onSignOut]
  );

  const syllabusLink = useMemo(() => {
    if (!primarySyllabus) return null;
    const countryAdjective = getCountryAdjective(primarySyllabus.country);
    const year = primarySyllabus.year;
    const syllabusId = primarySyllabus.id;
    const linkText = `${year} ${countryAdjective} Syllabus`;
    const linkUrl = `/syllabi/${syllabusId}/user_grade_syllabus`;

    return (
      <a
        href={linkUrl}
        className="text-blue-400 hover:text-blue-200 px-3 py-2 rounded-md text-sm font-bold transition duration-150 ease-in-out"
      >
        {linkText}
      </a>
    );
  }, [primarySyllabus]);

  const baseLinkClasses =
    "text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition duration-150 ease-in-out";

  return (
    <nav id="navbar" className="bg-gray-800 shadow-lg font-sans" style={{ display: "flex" }}>
      <div
        id="nav-container"
        className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-row justify-between items-center h-20"
      >
        <div className="flex-shrink-0">
          <a href="/" className="flex items-center space-x-2">
            <img className="h-16 w-auto max-h-20 object-contain" src={tuff_logo} alt="club logo" />
          </a>
        </div>

        <div className="flex items-center">
          <div className="flex space-x-4">
            <a href="/" className={baseLinkClasses}>
              Home
            </a>
            <a href="/whatisjiujitsu" className={baseLinkClasses}>
              What Is Jiu Jitsu?
            </a>
            <a href="/profiles" className={baseLinkClasses}>
              Who Are We?
            </a>
            <a href="/waiver/new" className={baseLinkClasses}>
              Create Waiver
            </a>

            {currentUser ? (
              <>
                {syllabusLink}

                {currentUser?.is_admin && (
                  <a href="/technique/new" className={baseLinkClasses}>
                    Add Techniques To Syllabus
                  </a>
                )}

                <a href="/" onClick={handleSignOutClick} className={baseLinkClasses}>
                  Sign Out
                </a>

                {currentUser.is_admin && (
                  <a href="/admin" className={baseLinkClasses}>
                    Admin Page
                  </a>
                )}

                <span
                  className="text-green-400 cursor-default px-3 py-2 text-sm font-medium whitespace-nowrap"
                  style={{ pointerEvents: "none" }}
                >
                  Welcome {currentUser.first_name} !
                </span>
              </>
            ) : (
              <>
                <a href="/sign_in" className={baseLinkClasses}>
                  Sign In
                </a>
                <a href="/sign_up" className={baseLinkClasses}>
                  Sign Up
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default React.memo(NavBar);
