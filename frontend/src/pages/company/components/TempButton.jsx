const TempButton = ({buttonText="", type, disabled}) => {
  return (
    <div>
        <button disabled={disabled} type={type || ""} className="border-white uppercase text-tiny text-white bg-black/60 border-2 px-8 py-2 rounded-full pointer-events-auto">
            {buttonText || "Click here"}
          </button>
    </div>
  )
}

export default TempButton
