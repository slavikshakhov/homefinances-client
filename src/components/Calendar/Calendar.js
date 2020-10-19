import React, { useState, useEffect, useContext } from "react";
import CalendarStyles from "./Calendar.module.css";
import Day from "../Day/Day";
import { DataContext } from "../DataProvider";
import {config} from '../../Constants';

const Calendar = ({ balanceForToday, calendarPopup }) => {
   var URL = config.url.API_URL
  const date = new Date();
  const currentYear = date.getFullYear();
  const currentMonth = date.getMonth();

  const [selectedDate, setSelectedDate] = useState(date.getDate());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [firstDayOfWeek, setFirstDayOfWeek] = useState(0);
  const [numberOfDaysInMonth, setNumberOfDaysInMonth] = useState(0);
  const [balances, setBalances] = useState({});
  const [filteredBalances, setFilteredBalances] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [selectedDateActivities, setSelectedDateActivities] = useState({});
  const [openSummeryForSelectedDate, setOpenSummeryForSelectedDate] = useState(
    false
  );

  const { decodedToken, temporaryActivity, setTemporaryActivity } = useContext(
    DataContext
  );

  console.log(balances);
  console.log(expenses);
  console.log(incomes);
  console.log(selectedDate, selectedMonth, selectedYear);
  console.log(filteredBalances);
  //const expensesByDate = _.groupBy(expenses, (el) => el.createdAt);

  // console.log(expensesByDate);

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  console.log(
    selectedMonth,
    selectedYear,
    firstDayOfWeek,
    numberOfDaysInMonth,
    selectedDate
  );
  useEffect(() => {
    selectMonth(selectedMonth, selectedYear);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    console.log("mounted");
    fetch(`${URL}/balances/${decodedToken.id}`)
      .then((resp) => resp.json())
      .then((balances) => {
        if (balances) {
          const balancesWithoutTime = balances.map((balance) => {
            return { ...balance, createdAt: balance.createdAt.slice(0, 10) };
          });
          const balancesGroupedByDate = groupElements(
            balancesWithoutTime,
            "createdAt"
          );
          setBalances(balancesGroupedByDate);
        } else {
          setBalances([]);
        }
      });
    fetch(`${URL}/incomes/${decodedToken.id}`)
      .then((resp) => resp.json())
      .then((incomes) => {
        const incomesWithoutTime =
          incomes &&
          incomes.map((income) => {
            return { ...income, createdAt: income.createdAt.slice(0, 10) };
          });

        console.log(incomesWithoutTime);
        const incomesGroupedByDate = groupElements(
          incomesWithoutTime,
          "createdAt"
        );
        console.log(incomesGroupedByDate);
        setIncomes(incomesGroupedByDate);
      });
    fetch(`${URL}/expenses/${decodedToken.id}`)
      .then((resp) => resp.json())
      .then((expenses) => {
        if (expenses) {
          const expensesWithoutTime = expenses?.map((expense) => {
            return { ...expense, createdAt: expense.createdAt.slice(0, 10) };
          });

          console.log(expensesWithoutTime);
          const expensesGroupedByDate = groupElements(
            expensesWithoutTime,
            "createdAt"
          );
          console.log(expensesGroupedByDate);
          setExpenses(expensesGroupedByDate);
        }
      });
  }, []);
  useEffect(() => {
    const year = selectedYear.toString();
    let month = (selectedMonth + 1).toString(); //add 0 if month length === 1
    month = month.length === 1 ? `0${month}` : month;
    const filteredBalancesMonthYear = filteredBalancesSelectedMonthYear(
      year,
      month
    );
    setFilteredBalances(filteredBalancesMonthYear);
  }, [selectedMonth, balances]);

  useEffect(() => {
    setTemporaryActivity(null);
    return () => setTemporaryActivity(null);
  }, []);
  //use result to send as daydata props to Day (populate cells with corresponding day)
  const filteredBalancesSelectedMonthYear = (year, month) => {
    const filtered = Object.keys(balances)
      .filter((el) => el.includes(`${year}-${month}`))
      .reduce((acc, objEl) => {
        acc[objEl] = balances[objEl];
        return acc;
      }, {});
    return filtered;
  };
  const groupElements = (arr, key) => {
    let result =
      arr &&
      arr.reduce((acc, el) => {
        acc[el[key]] = (acc[el[key]] || []).concat(el);
        return acc;
      }, {});
    console.log(result);
    return result;
  };

  const selectMonth = (month, year) => {
    setNumberOfDaysInMonth(32 - new Date(year, month, 32).getDate());
    setFirstDayOfWeek(new Date(year, month).getDay());
  };
  const setNextMonth = () => {
    setSelectedDate("");
    setSelectedYear(selectedMonth === 11 ? selectedYear + 1 : selectedYear);
    setSelectedMonth(selectedMonth === 11 ? 0 : selectedMonth + 1);
  };
  const setPreviousMonth = () => {
    setSelectedDate("");
    setSelectedYear(selectedMonth === 0 ? selectedYear - 1 : selectedYear);
    setSelectedMonth(selectedMonth === 0 ? 11 : selectedMonth - 1);
  };
  const selectDate = (year, month, date) => {
    setSelectedDate(new Date(year, month, date).getDate());
  };
  const showDataForSelectedDate = (y, m, d) => {
    console.log(y, m, d);
    m =
      m.toString().length <= 1 ? `0${(m + 1).toString()}` : (m + 1).toString();
    d = d.toString().length <= 1 ? `0${d.toString()}` : d;
    const fullDate = y + "-" + m + "-" + d;
    let thisDayExpenses = null;
    Object.keys(expenses).map((exp) => {
      if (exp === fullDate) {
        thisDayExpenses = expenses[exp];
      }
    });
    let thisDayIncomes = null;
    Object.keys(incomes).map((inc) => {
      if (inc === fullDate) {
        thisDayIncomes = incomes[inc];
      }
    });
    console.log(thisDayIncomes);
    console.log(thisDayExpenses);
    setSelectedDateActivities({
      expenses: thisDayExpenses,
      incomes: thisDayIncomes,
    });
    setOpenSummeryForSelectedDate(true);
  };

  const renderCalendar = () => {
    const cells = [];
    let index = firstDayOfWeek;
    let x = 1;
    const zero = selectedMonth.toString().length === 1 ? "0" : "";
    cells.push(
      <div className={`${CalendarStyles.cell} bg-green-300 text-center`}>
        Sun
      </div>
    );
    cells.push(
      <div className={`${CalendarStyles.cell} bg-green-300 text-center`}>
        Mon
      </div>
    );
    cells.push(
      <div className={`${CalendarStyles.cell} bg-green-300 text-center`}>
        Tue
      </div>
    );
    cells.push(
      <div className={`${CalendarStyles.cell} bg-green-300 text-center`}>
        Wed
      </div>
    );
    cells.push(
      <div className={`${CalendarStyles.cell} bg-green-300 text-center`}>
        Thur
      </div>
    );
    cells.push(
      <div className={`${CalendarStyles.cell} bg-green-300 text-center`}>
        Fr
      </div>
    );
    cells.push(
      <div className={`${CalendarStyles.cell} bg-green-300 text-center`}>
        Sat
      </div>
    );

    for (let i = 0; i < 40; i++) {
      if (i < index) {
        cells.push(<div key={i} className={CalendarStyles.cell}></div>);
      }
      if (i >= index && i < numberOfDaysInMonth + index) {
        cells.push(
          <div key={i} className={CalendarStyles.cell}>
            <Day
              selectedYear={selectedYear}
              date={x}
              balancesData={
                filteredBalances[
                  `${selectedYear}-${zero}${selectedMonth + 1}-${
                    //correction if month 11
                    x.toString().length === 1 ? "0" : ""
                  }${x}`
                ]
              }
              balanceForToday={balanceForToday}
              selectedMonth={selectedMonth}
              selectedDate={selectedDate}
              idOfDate={`${selectedYear}${selectedMonth}${x}`}
              selectDate={selectDate}
              showDataForSelectedDate={showDataForSelectedDate}
            />
          </div>
        );
        x += 1;
      }
    }
    return <div className={CalendarStyles.calendarBody}>{cells}</div>;
  };
  const renderSummery = () => {
    const rows = [];
    rows.push(
      <div className="flex justify-end">
        <button
          className={`${CalendarStyles.backBtn} pt-1 text-base font-bold`}
          onClick={() => {
            calendarPopup(false);
          }}
        >
          X
        </button>
      </div>
    );
    rows.push(
      <h3 className="font-sans text-2xl text-center capitalize text-white mb-1">
        expenses
      </h3>
    );
    rows.push(
      <div className="w-full">
        <table className="w-full">
          <tr className="w-full flex bg-red-400">
            <th className="flex-1">Time</th>
            <th className="flex-1">Item</th>
            <th className="flex-1">Sum</th>
          </tr>
          {selectedDateActivities?.expenses?.map((item) => {
            return (
              <tr className="w-full flex bg-red-400">
                <td className="flex-1 text-center">
                  {item.updatedAt?.split("T")[1].split(".")[0]}
                </td>
                <td className="flex-1 text-center">{item.item}</td>
                <td className="flex-1 text-center">{item.money}</td>
              </tr>
            );
          })}
          {temporaryActivity?.activity === "expenses" && (
            <tr className="w-full flex bg-red-400">
              <td className="flex-1 text-center">
                {temporaryActivity.updatedAt?.split("T")[1].split(".")[0]}
              </td>
              <td className="flex-1 text-center">{temporaryActivity.item}</td>
              <td className="flex-1 text-center">{temporaryActivity.money}</td>
            </tr>
          )}
        </table>
      </div>
    );
    rows.push(
      <h3 className="font-sans text-2xl text-center capitalize text-white mb-1">
        earnings
      </h3>
    );
    rows.push(
      <div className="w-full">
        <table className="w-full">
          <tr className="w-full flex bg-green-400">
            <th className="flex-1">Time</th>
            <th className="flex-1">Source</th>
            <th className="flex-1">Sum</th>
          </tr>
          {selectedDateActivities?.incomes?.map((item) => {
            return (
              <tr className="w-full flex bg-green-400">
                <td className="flex-1 text-center">
                  {item.updatedAt?.split("T")[1].split(".")[0]}
                </td>
                <td className="flex-1 text-center">{item.item}</td>
                <td className="flex-1 text-center">{item.money}</td>
              </tr>
            );
          })}
          {temporaryActivity?.activity === "incomes" && (
            <tr className="w-full flex bg-green-400">
              <td className="flex-1 text-center">
                {temporaryActivity.updatedAt?.split("T")[1].split(".")[0]}
              </td>
              <td className="flex-1 text-center">{temporaryActivity.item}</td>
              <td className="flex-1 text-center">{temporaryActivity.money}</td>
            </tr>
          )}
        </table>
      </div>
    );
    rows.push(
      <div className="flex justify-end">
        <button
          className={`${CalendarStyles.backBtn} pt-1 text-base font-bold`}
          onClick={() => {
            calendarPopup(false);
          }}
        >
          X
        </button>
      </div>
    );

    return rows;
  };
  return (
    <div className="">
      <div className={CalendarStyles.container}>
        <div className={CalendarStyles.btnContainer}>
          <button
            className={
              !openSummeryForSelectedDate ? CalendarStyles.previous : ""
            }
            onClick={() => setPreviousMonth()}
          ></button>
        </div>

        <div className="flex flex-col items-center">
          <div
            className={`${CalendarStyles.header} ${
              openSummeryForSelectedDate && CalendarStyles.moveHeaderToLeft
            }`}
          >
            <p className="font-bold">
              {months[selectedMonth]}
              {openSummeryForSelectedDate ? `${selectedDate}` : ""},{" "}
              {selectedYear}{" "}
            </p>
            <h3 className="text-center text-lg text-white">
              Select a date to see your expenses and earnings
            </h3>
          </div>
          <div className={CalendarStyles.innerContainer}>
            {openSummeryForSelectedDate ? renderSummery() : renderCalendar()}
          </div>
        </div>
        <div className={CalendarStyles.btnContainer}>
          <button
            className={!openSummeryForSelectedDate ? CalendarStyles.next : ""}
            onClick={() => setNextMonth()}
          ></button>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
