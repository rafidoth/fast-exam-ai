const MyBtn = ({ onClick, children, className, disabled }) => {
  return (
    <button
      className={`flex justify-center items-center gap-2 cursor-pointer transition-colors duration-300 px-2 rounded-sm  ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default MyBtn;
