import { forwardRef, useState } from "react";
import { BsEyeFill, BsEyeSlashFill } from "react-icons/bs";
const PasswordInput = forwardRef((props: any, ref:any) => {
  const [type, setType] = useState<string>("password");
  return (
    <>
      <div className="flex relative">
        <input
          ref={ref}
          {...props.register}
          type={type}
          autoComplete="new-password"
          className="input-field relative"
        />
        <div className="absolute aspect-square p-2 flex items-center justify-center top-0 right-0 bottom-0">
          <button
            type="button"
            className="w-full h-full flex items-center justify-center text-slate-400 "
            onClick={() => {
              if (type === "password") {
                setType("text");
              } else {
                setType("password");
              }
            }}
          >
            {type === "password" ? (
              <BsEyeFill size={20} />
            ) : (
              <BsEyeSlashFill size={20} />
            )}
          </button>
        </div>
      </div>
      {props.error ? (
        <span className="text-xs text-red-500 ">{props.error.message}</span>
      ) : null}
    </>
  );
});

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
