function Techniques(props){
    {props.element.map(element => {
        return(
            <>
            <div>{element.summary}</div>
            <br />
            </>
        )
    })}
    
}
export default Techniques;