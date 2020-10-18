import React, { useState, useEffect, useContext } from "react";
import StartStyles from "./Start.module.css";
import { useHistory } from "react-router-dom";
import { DataContext } from "../DataProvider";

const Start = () => {
  const history = useHistory();

  const validationRulres = {
    min: 4,
    max: 8,
    capitalLetter: new RegExp("(?=.*[A-Z])"),
  };
  const { isAuth, setToken } = useContext(DataContext);
  console.log(isAuth);

  const [loginMode, setLoginMode] = useState(false);
  const [registerMode, setRegisterMode] = useState(false);

  const [everOut, setEverOut] = useState({});
  const [isValue, setIsValue] = useState({});
  const [inputValue, setInputValue] = useState({ username: "", password: "" });

  const [inputData, setInputData] = useState({});
  const [errors, setErrors] = useState({ username: {}, password: {} });
  const [statusOnSubmit, setStatusOnSubmit] = useState("");
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    let errs = {};
    if (inputData && inputData.username) {
      const { required, minError, maxError } = inputData.username;
      errs = { ...errs, username: { required, minError, maxError } };
    }
    if (inputData && inputData.password) {
      const {
        required,
        minError,
        maxError,
        capitalLetterMissing,
      } = inputData.password;
      errs = {
        ...errs,
        password: { required, minError, maxError, capitalLetterMissing },
      };
    }
    console.log(errs);
    setErrors(errs);
  }, [inputData]);
  useEffect(() => {
    let usernameErrors = [];
    let passwordErrors = [];
    if (errors && errors.username) {
      usernameErrors = Object.values(errors?.username).filter((err) => {
        return err === true;
      });
    }
    if (errors && errors.password) {
      const passwordErrors = Object.values(errors?.password).filter((err) => {
        return err === true;
      });
    }

    const isValid = !usernameErrors.length && !passwordErrors.length;
    setIsValid(isValid);
  }, [errors]);

  const onInputChange = ({ target: { name, value } }) => {
    const isValue = value?.length > 0 ? true : false;
    setIsValue({ [name]: isValue });
    value = value ? value : "";
    setInputValue({ ...inputValue, [name]: value });

    // username and password are required
    let required =
      !isValue && inputData && inputData[name]?.everOut ? true : false;

    //password must containe at least one capital letter
    console.log(inputData[name]?.everOut);

    let capitalLetterMissing =
      name === "password" &&
      isValue &&
      inputData &&
      inputData[name]?.everOut &&
      !validationRulres.capitalLetter.test(value)
        ? true
        : false;
    // username and password must be between 4 and 8 characters
    let minError =
      isValue &&
      inputData &&
      inputData[name]?.everOut &&
      value.length < validationRulres.min
        ? true
        : false;
    let maxError =
      isValue &&
      inputData &&
      inputData[name]?.everOut &&
      value.length >= validationRulres.max
        ? true
        : false;
    setInputData({
      ...inputData,
      [name]: {
        isValue,
        everOut,
        value,
        required,
        capitalLetterMissing,
        minError,
        maxError,
      },
    });
  };
  const onInputBlur = ({ target: { name, value } }) => {
    setEverOut({ [name]: true });
    const isValue = value?.length > 0 ? true : false;
    setIsValue({ [name]: isValue });
    let required = !isValue ? true : false;
    let capitalLetterMissing =
      isValue && !validationRulres.capitalLetter.test(value) ? true : false;
    let minError =
      isValue &&
      inputData &&
      inputData[name]?.everOut &&
      value.length <= validationRulres.min
        ? true
        : false;
    let maxError =
      isValue &&
      inputData &&
      inputData[name]?.everOut &&
      value.length >= validationRulres.max
        ? true
        : false;
    setInputData({
      ...inputData,
      [name]: {
        isValue,
        everOut: true,
        value,
        required,
        capitalLetterMissing,
        minError,
        maxError,
      },
    });
  };

  const onFromSubmit = async (e) => {
    e.preventDefault();
    console.log(inputData);
    console.log(errors);
    let status = "";

    console.log(isValid);
    console.log(inputValue);
    if (isValid) {
      const user = {
        username: inputValue.username,
        password: inputValue.password,
      };

      console.log(user);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
        mode: "no-cors",
      };

      if (registerMode) {
        let resp = await fetch(
          "http://localhost:4000/auth/register",
          requestOptions
        );
        if (resp.status === 400) {
          status = "This name already exists!";
        }
        if (resp.status === 200) {
          let data = await resp.json();
          console.log(data);
          //changeUserStatus();
          status = `${data.message}! Please log in to proceed`;
          setLoginMode(true);
        }
      }

      if (loginMode) {
        let resp = await fetch(
          "https://homefinances-database.herokuapp.com/auth/login",
          // "http://localhost:4000/auth/login",
          requestOptions
        );

        if (resp.status === 401) {
          console.log("401 unauthorized");

          setStatusOnSubmit("No user with this name!");
          setTimeout(() => {
            setStatusOnSubmit("");
          }, 4000);

          return;
        }
        if (resp.status === 403) {
          console.log("403 forbidden");

          setStatusOnSubmit("Password incorrect!");
          setTimeout(() => {
            setStatusOnSubmit("");
          }, 4000);
          return;
        }
        let data = await resp.json();
        console.log(data);
        //changeUserStatus();
        setToken(data.token);
        history.push("/home");
      }
    }
    console.log(status);
    setInputValue({ username: "", password: "" });
    setStatusOnSubmit(status);
    setTimeout(() => {
      setStatusOnSubmit("");
    }, 4000);
  };

  return (
    <div className={StartStyles.container}>
      <div className={StartStyles.overlay}>
        <div className="w-full h-full flex justify-center items-center">
          {loginMode || registerMode ? (
            <div
              className={`${StartStyles.holder} bg-white rounded-full border-8 border-blue-700`}
            >
              {statusOnSubmit ? (
                <div className={StartStyles.status}>
                  <p className={StartStyles.center}>{statusOnSubmit}</p>
                </div>
              ) : null}
              <form className={`items-stretch flex`} onSubmit={onFromSubmit}>
                <input
                  className="w-2/5 border-r-4 border-blue-700 outline-none p-2 px-4 placeholder-blue-700 placeholder-opacity-75 text-blue-700 font-bold text-lg border-0 rounded-l-full"
                  value={inputValue.username}
                  type="text"
                  name="username"
                  onChange={onInputChange}
                  onBlur={onInputBlur}
                  placeholder="Name"
                />
                {errors.username?.required ? (
                  <div
                    className={`${StartStyles.usernameError} ${StartStyles.errors}`}
                  >
                    Username required!
                  </div>
                ) : null}
                {registerMode && errors.username?.minError ? (
                  <div
                    className={`${StartStyles.usernameError} ${StartStyles.errors}`}
                  >
                    {`Must be at least ${validationRulres.min} characters`}
                  </div>
                ) : null}
                {registerMode && errors.username?.maxError ? (
                  <div
                    className={`${StartStyles.usernameError} ${StartStyles.errors}`}
                  >
                    {`Maximum ${validationRulres.max} characters`}
                  </div>
                ) : null}

                <input
                  className="w-2/5  border-r-4 border-blue-700 outline-none p-2 px-4 placeholder-blue-700 placeholder-opacity-75 text-blue-700 font-bold text-lg"
                  type="password"
                  name="password"
                  value={inputValue.password}
                  onChange={onInputChange}
                  onBlur={onInputBlur}
                  placeholder="Password"
                />
                {errors.password?.required ? (
                  <div
                    className={`${StartStyles.passwordError} ${StartStyles.errors}`}
                  >
                    Password required!
                  </div>
                ) : null}
                {registerMode && errors.password?.minError ? (
                  <div
                    className={`${StartStyles.passwordError} ${StartStyles.errors}`}
                  >
                    {`Must be at least ${validationRulres.min} characters`}
                  </div>
                ) : null}
                {registerMode && errors.password?.maxError ? (
                  <div
                    className={`${StartStyles.passwordError} ${StartStyles.errors}`}
                  >
                    {`Maximum ${validationRulres.max} characters`}
                  </div>
                ) : null}
                {registerMode &&
                errors.password?.capitalLetterMissing &&
                !errors.password?.minError &&
                !errors.password?.maxError ? (
                  <div
                    className={`${StartStyles.passwordError} ${StartStyles.errors}`}
                  >
                    {`Should include a capital letter!`}
                  </div>
                ) : null}

                <button
                  className={`btn border-0 bg-blue-700 p-1 w-1/5 uppercase text-white m-1 rounded-r-full ${
                    !isValid ? StartStyles.invalid : " "
                  }`}
                  type="submit"
                >
                  {`${loginMode ? "Login" : "Register"}`}
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-full border-8 border-blue-700 w-64">
              <div className="flex">
                <button
                  className="btn flex-1 border-0 bg-blue-700 p-1 w-1/5 uppercase text-white m-1 rounded-l-full"
                  type="button"
                  onClick={() => setLoginMode(true)}
                >
                  Login
                </button>
                <button
                  className="btn flex-1 border-0 bg-blue-700 p-1 w-1/5 uppercase text-white m-1 rounded-r-full"
                  type="button"
                  onClick={() => setRegisterMode(true)}
                >
                  Register
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Start;
