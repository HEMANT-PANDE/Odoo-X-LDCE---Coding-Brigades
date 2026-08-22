const DEFAULT_TRANSPORT_PER_STOP = 40; // flat hop cost between stops, if trip doesn't override
const DEFAULT_MEALS_PER_DAY = 25;

function daysBetween(start, end) {
  const ms = new Date(end) - new Date(start);
  return Math.round(ms / 86400000) + 1; // inclusive of both ends
}

/**
 * Pure budget calculator. Takes a trip with nested stops (each with a city) and
 * each stop's activities (each with an activity). Computed on read — nothing stored.
 */
function computeBudget(trip) {
  const transportPerStop = Number(trip.budgetTransportPerStop ?? DEFAULT_TRANSPORT_PER_STOP);
  const mealsPerDay = Number(trip.budgetMealsPerDay ?? DEFAULT_MEALS_PER_DAY);

  let transport = 0;
  let stay = 0;
  let meals = 0;
  let activities = 0;
  let totalDays = 0;
  const perStop = [];

  for (const stop of trip.stops) {
    const days = daysBetween(stop.startDate, stop.endDate);
    totalDays += days;
    const stayPerDay = Number(trip.budgetStayPerDay ?? stop.city.costIndex);
    const stopStay = stayPerDay * days;
    const stopMeals = mealsPerDay * days;
    const stopActivities = stop.activities.reduce(
      (sum, sa) => sum + Number(sa.costOverride ?? sa.activity.cost),
      0
    );

    transport += transportPerStop;
    stay += stopStay;
    meals += stopMeals;
    activities += stopActivities;

    perStop.push({
      stopId: stop.id,
      city: stop.city.name,
      days,
      transport: transportPerStop,
      stay: round2(stopStay),
      meals: round2(stopMeals),
      activities: round2(stopActivities),
      total: round2(transportPerStop + stopStay + stopMeals + stopActivities),
    });
  }

  const total = transport + stay + meals + activities;
  const totalBudget = trip.totalBudget != null ? Number(trip.totalBudget) : null;
  const dailyBudget = totalBudget != null && totalDays ? totalBudget / totalDays : null;

  if (dailyBudget != null) {
    for (const stop of perStop) {
      stop.perDay = round2(stop.total / stop.days);
      stop.overBudgetDay = stop.perDay > dailyBudget;
    }
  }

  return {
    breakdown: { transport: round2(transport), stay: round2(stay), meals: round2(meals), activities: round2(activities) },
    total: round2(total),
    totalDays,
    averagePerDay: totalDays ? round2(total / totalDays) : 0,
    totalBudget,
    dailyBudget: dailyBudget != null ? round2(dailyBudget) : null,
    overBudget: totalBudget != null ? total > totalBudget : false,
    overBudgetDays: dailyBudget != null ? perStop.filter((s) => s.overBudgetDay).reduce((sum, s) => sum + s.days, 0) : 0,
    perStop,
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

module.exports = { computeBudget };
