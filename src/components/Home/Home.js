import React, { useState, useEffect, useContext } from "react";
import HomeStyles from "./Home.module.css";
//import moment from "moment";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import Calendar from "../Calendar/Calendar";
import { DataContext } from "../DataProvider";

const Home = () => {
  const {
    removeToken,
    decodedToken,
    temporaryActivity,
    setTemporaryActivity,
    balance,
    setBalance,
  } = useContext(DataContext);

  const [changeBalanceVal, setChangeBalanceVal] = useState(balance);
  const [changeBalancePopup, setChangeBalancePopup] = useState(false);
  const [popup, setPopup] = useState(false);
  //const [date, setDate] = useState(() => moment());
  const [startDate, setStartDate] = useState(() => new Date());
  const [plus, setPlus] = useState(false);
  const [minus, setMinus] = useState(false);

  const [inputItem, setInputItem] = useState("");
  const [inputSum, setInputSum] = useState("");
  const [balanceAnimation, setBalanceAnimation] = useState(false);
  const [renderCalendar, setRenderCalendar] = useState(false);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`http://localhost:4000/balances/${decodedToken.id}`)
      .then((resp) => resp.json())
      .then((data) => {
        console.log(data);
        if (data.length > 0) {
          const lastBalance = data[data.length - 1].balance;
          setBalance(lastBalance);
          setChangeBalanceVal(lastBalance);
        }
      });
  }, [balance]);
  const balancePopup = (val) => {
    setChangeBalancePopup(val);
    setPopup(!val);
    setRenderCalendar(!val);
  };
  const activityPopup = (val) => {
    setChangeBalancePopup(!val);
    setPopup(val);
  };
  const calendarPopup = (val) => {
    if (val === true) {
      setChangeBalancePopup(!val);
    }
    setRenderCalendar(val);
  };
  const popupMode = (mode, sign) => {
    setPopup(mode);
    if (sign === "add") {
      setPlus(true);
      setMinus(false);
    }
    if (sign === "subtract") {
      setMinus(true);
      setPlus(false);
    }
  };

  console.log(plus, minus, popup);

  const onFormSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log({ inputItem, inputSum });
    }
    setTimeout(() => {
      setBalanceAnimation(true);
    }, 300);
    setTimeout(() => {
      const activity = plus ? "incomes" : "expenses";
      if (plus) {
        updateBalance(balance + parseInt(inputSum));
        setBalance(balance + parseInt(inputSum));
      }
      if (minus) {
        updateBalance(balance - parseInt(inputSum));
        setBalance(balance - parseInt(inputSum));
      }
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item: inputItem,
          money: inputSum,
          UserId: decodedToken.id,
          activity: activity,
        }),
      };

      fetch(`http://localhost:4000/${activity}/new`, requestOptions)
        .then((resp) => resp.json())
        .then((data) => {
          console.log(data);
          setTemporaryActivity(data);
        });
    }, 1500);

    setTimeout(() => {
      setInputItem("");
      setInputSum("");
      setBalanceAnimation(false);
      setErrors({});
    }, 1600);
  };
  const validate = () => {
    if (inputItem === "") {
      setErrors({ item: "Item required" });
    }
    if (inputSum === "") {
      setErrors({ sum: "0 not allowed" });
    }
    if (inputItem === "" && inputSum === "") {
      setErrors({ item: "Item required", sum: "0 not allowed" });
    }
    return inputItem === "" || inputSum === "" ? false : true;
  };
  const updateBalance = (newBalance) => {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        balance: newBalance,
        UserId: decodedToken.id,
      }),
    };
    fetch("http://localhost:4000/balances/new", requestOptions)
      .then((resp) => resp.json())
      .then((data) => {
        console.log("balance updated");
      });
  };
  const logout = () => {
    removeToken();
  };
  const changeBalance = (e) => {
    e.preventDefault();
    setBalance(parseInt(changeBalanceVal));

    setChangeBalancePopup(false);
    updateBalance(changeBalanceVal);
  };

  return (
    <div className={HomeStyles.container}>
      <div className={HomeStyles.overlay}>
        <div className="h-16 md:h-30 lg:h-32 w-full flex items-center justify-around">
          <div
            className={`relative ${balanceAnimation && HomeStyles.animatedSum}`}
          >
            <div
              className={`${HomeStyles.balance} font-bold text-lg lg:text-2xl uppercase text-gray-800`}
            >
              <span className="hidden md:inline-block">balance</span>{" "}
              <span className="hidden md:inline-block text-red-700 text-2xl lg:text-2xl">
                &euro;{balance}
              </span>
              <button
                onClick={() => balancePopup(true)}
                className="ml-5 w-16 h-16 md:w-20 md:h-16  hover:bg-blue-500 bg-blue-700 uppercase rounded-full text-sm lg:text-base lg:font-bold text-white"
              >
                <span className="hidden md:inline-block">Change</span>
                <span className="inline-block md:hidden">&euro;{balance}</span>
              </button>
              {changeBalancePopup && (
                <div className={!popup && HomeStyles.correctBalance}>
                  <form
                    onSubmit={changeBalance}
                    className="flex items-center justify-between"
                  >
                    <input
                      className={`${HomeStyles.changeBalance} text-center`}
                      type="number"
                      name="newBalance"
                      value={changeBalanceVal}
                      onChange={(e) => setChangeBalanceVal(e.target.value)}
                    />

                    <button
                      className={`text-sm font-bold text-gray-800 bg-white uppercase ${HomeStyles.changeBalanceBtn}`}
                      type="submit"
                    >
                      Change
                    </button>
                  </form>
                </div>
              )}
            </div>
            <div className={HomeStyles.movingSum}>
              {balanceAnimation && plus
                ? `+  ${inputSum}`
                : balanceAnimation && minus
                ? `-  ${inputSum}`
                : ""}
            </div>
          </div>
          <button
            className={`flex justify-center items-center w-12 h-12 lg:w-16 lg:h-16 font-bold lg:text-lg uppercase text-white hover:bg-red-500 bg-red-700 border-0 rounded-full outline-none ${HomeStyles.noOutline}`}
            onClick={() => {
              popupMode(true, "subtract");
              activityPopup(true);
            }}
          >
            -
          </button>
          <button
            className={`flex justify-center items-center w-12 h-12 lg:w-16 lg:h-16 font-bold lg:text-lg  uppercase text-white hover:bg-red-500 bg-red-700 border-0 rounded-full outline-none ${HomeStyles.noOutline}`}
            onClick={() => {
              popupMode(true, "add");
              activityPopup(true);
            }}
          >
            +
          </button>

          <button
            className={`ml-5 w-16 h-16 lg:w-20 lg:h-16  hover:bg-blue-500 bg-blue-700 uppercase rounded-full text-sm lg:text-base lg:font-bold text-white outline-none border-none ${HomeStyles.noOutline}`}
            onClick={() => calendarPopup(!renderCalendar)}
          >
            {!renderCalendar ? `history` : `close`}
          </button>
          <button
            className={`ml-5 w-16 h-16 lg:w-20 lg:h-16 hover:bg-blue-500 bg-blue-700 uppercase rounded-full text-sm lg:text-base lg:font-bold text-white ${HomeStyles.noOutline}`}
            onClick={logout}
          >
            Logout
          </button>
        </div>
        <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between">
          {popup ? (
            <div className="px-1 lg:px-6 py-3 md:inline-flex items-center justify-start flex-col bg-white border-0 rounded-md mt-5 mb-5 md:ml-10 md:mt-16 md:mr-4">
              <div className="flex w-full items-center justify-between">
                <h3
                  className={`flex flex-wrap items-center text-center justify-center flex-6 text-lg font-bold ${
                    plus ? "text-blue-500" : "text-red-500"
                  }`}
                >
                  <span>{plus ? "New Income" : minus && "New Expense"}</span>
                  <span>
                    <DatePicker
                      className="text-center"
                      locale="en"
                      selected={startDate}
                      onChange={(d) => setStartDate(d)}
                    />
                  </span>
                </h3>

                <button
                  className={`flex-1 flex items-center justify-end text-md font-bold p-1`}
                  onClick={() => {
                    setPopup(false);
                    setPlus(false);
                    setMinus(false);
                  }}
                >
                  x
                </button>
              </div>
              <div
                className={`${HomeStyles.divider} ${
                  plus ? "bg-blue-500" : minus && "bg-red-500"
                }`}
              ></div>
              <form className="" onSubmit={onFormSubmit}>
                <div className="mb-4">
                  <div className={`flex flex-col ${HomeStyles.popupItems}`}>
                    <div className="flex flex-col lg:flex-row">
                      <input
                        type="text"
                        className="w-full lg:w-1/2 bg-gray-400 border-0 rounded-md outline-none py-2 lg:mr-2 uppercase placeholder-blue-700 placeholder-opacity-75 text-blue-700 font-bold text-center mb-2 lg:mb-0"
                        placeholder={`${errors?.item ? errors.item : "item"}`}
                        value={inputItem}
                        onChange={(e) => setInputItem(e.target.value)}
                        name="item"
                      ></input>
                      <div className="flex-1 flex lg:w-1/2">
                        <span className="lg:ml-2 lg:mr-0 px-2 lg:px-3 py:2 lg:py-2 bg-gray-600 text-center text-2xl font-bold">
                          {plus ? `+` : minus ? `-` : ``}
                        </span>
                        <input
                          type="number"
                          className="w-full bg-gray-400 border-0 rounded-lg outline-none py-2 uppercase placeholder-blue-700 placeholder-opacity-75 text-blue-700 font-bold text-center"
                          placeholder={`${errors?.item ? errors.sum : "0"}`}
                          value={inputSum}
                          onChange={(e) => setInputSum(e.target.value)}
                          name="sum"
                        ></input>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className={`flex items-center justify-center flex-1 py-2 border-0 rounded-md uppercase text-white font-bold mt-3 ${
                        plus ? "bg-blue-500" : minus && "bg-red-500"
                      }`}
                    >
                      Add Item
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div></div>
          )}
          {renderCalendar && (
            <div className="md:mt-5 md:mr-20">
              <Calendar
                balanceForToday={balance}
                calendarPopup={calendarPopup}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
