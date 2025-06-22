import { format } from "date-fns"; // npm install date-fns

export const prepareUsageData = (parsedTasks) => {
  const usageMap = {};

  parsedTasks.forEach((task) => {
    const date = format(new Date(task.createdAt?.seconds * 1000), "yyyy-MM-dd");

    if (!usageMap[date]) {
      usageMap[date] = { date, tasksAdded: 0, tasksCompleted: 0 };
    }

    usageMap[date].tasksAdded += 1;

    if (task.isCompleted) {
      usageMap[date].tasksCompleted += 1;
    }
  });

  // Convert back to array
  return Object.values(usageMap);
};
