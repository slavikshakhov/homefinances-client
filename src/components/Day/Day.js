import React from 'react'
import DayStyles from './Day.module.css'

const Day = ({
  balanceForToday,
  selectedYear,
  selectedDate,
  date,
  selectedMonth,
  idOfDate,
  selectDate,
  balancesData,
  showDataForSelectedDate,
}) => {
  const day = parseInt(date)
  const month = parseInt(selectedMonth)
  const id = parseInt(idOfDate)

  const thisYear = new Date().getFullYear()
  let thisMonth = new Date().getMonth() + 1
  let thisDate = new Date().getDate()
  const formattedMonth =
    thisMonth.toString().length === 1 ? `0${thisMonth}` : thisMonth
  const formattedDate =
    thisDate.toString().length === 1 ? `0${thisDate}` : thisDate
  const formattedFullDate =
    thisYear + '-' + formattedMonth + '-' + formattedDate

  let balance = 0
  if (typeof balancesData !== 'undefined') {
    if (formattedFullDate === balancesData[0].createdAt) {
      balance = balanceForToday
    } else {
      balance = balancesData[balancesData.length - 1].balance
    }
  }

  return (
    <button
      className={`${DayStyles.container} ${
        selectedDate === date && DayStyles.selectedDate
      }`}
      onClick={() => {
        selectDate(selectedYear, selectedMonth, date)
        showDataForSelectedDate(selectedYear, selectedMonth, date)
      }}
    >
      <div className={DayStyles.cell}>
        <p className={DayStyles.date}>{day}</p>

        <div className="rounded-md flex items-center justify-center mt-3">
          {balance}
        </div>
      </div>
    </button>
  )
}

export default Day
