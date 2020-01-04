import React from 'react';

const engeryContent = {
  pizza: 1500,
  chips: 500,
  icecream: 300,
  snickers: 250,
  beer: 200,
  apple: 50,
  carrot: 30,
};

const ratios = {
  pizza: 1,
  beerPizza: 2,
  chips: 2,
  beerChips: 3,
  icecream: 3,
  snickers: 2,
};

const names = {
  chips: ["chipspåse", "chipspåsar"],
  beer: ["glas öl", "glas öl"],
  pizza: ["pizza", "pizzor"],
  icecream: ["storstrut", "storstrutar"],
  snickers: ["snickers", "snickers"],
  apple: ["äpple", "äpplen"],
  carrot: ["morot", "morötter"],
};

function count(remaining, needed, nWanted, accumulator, key) {
  for (let i=0; i<nWanted; i++) {
    if (remaining > needed) {
      accumulator[key] += 1;
      remaining -= needed;
    } else {
      return remaining;
    }
  }
  return remaining;
}

export default function CompensateCalories({ events }) {
  const calories = events.reduce((acc, evt) => (evt.calories == null ? 0 : evt.calories) + acc, 0);
  let remaining = calories;
  let prevRemaing = null;
  const countGood = {pizza: 0, chips: 0, icecream: 0, snickers: 0, beer: 0};
  // The good stuff
  while (remaining !== prevRemaing) {
    prevRemaing = remaining;
    remaining = count(remaining, engeryContent.pizza, ratios.pizza, countGood, 'pizza');
    remaining = count(remaining, engeryContent.beer, ratios.beerPizza, countGood, 'beer');
    remaining = count(remaining, engeryContent.chips, ratios.chips, countGood, 'chips');
    remaining = count(remaining, engeryContent.beer, ratios.beerChips, countGood, 'beer');
    remaining = count(remaining, engeryContent.icecream, ratios.icecream, countGood, 'icecream');
    remaining = count(remaining, engeryContent.snickers, ratios.snickers, countGood, 'snickers');
  }
  // The bad stuff
  prevRemaing = null;
  const countBad = {apple: 0, carrot: 0};
  while (remaining !== prevRemaing) {
    prevRemaing = remaining
    remaining = count(remaining, engeryContent.apple, 2, countBad, 'apple');
    remaining = count(remaining, engeryContent.carrot, 1, countBad, 'carrot');
  }
  const goodLI = Object
    .entries(countGood)
    .filter(([key, count]) => count > 0)
    .map(([key, count]) => (
      <div className="pill" key={key}><strong>{count}</strong> {names[key][count > 1 ? 1 : 0]}</div>
    ));
  const badLI = Object
    .entries(countBad)
    .filter(([key, count]) => count > 0)
    .map(([key, count]) => (
      <div className="pill" key={key}><strong>{count}</strong> {names[key][count > 1 ? 1 : 0]}</div>
    ));
  return (
    <div>
      <h2>Kalorikompensation</h2>
      <em>Så mycket måste du stoppa i dig {calories.toFixed(0)} kcal!</em>
      <div className="pill-box">
        {goodLI}
        {badLI}
      </div>
    </div>
  );
}
