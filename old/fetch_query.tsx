// import { displayUserInfo } from "./display_user_info";
// import { displayUserXp } from "./display_user_xp";
// import { createTimeline } from "./create-timeline";

// export default async function fetchData(): Promise<void> {
//   console.log("fetching data...");
//   const jwt = localStorage.getItem("jwt");
//   if (!jwt) {
//     window.location.href = "/";
//     return;
//   }

//   const query = `
//     {
//   user {
//     login
//     attrs
//     campus
//     level: transactions(
//       where: {type: {_eq: "level"}, path: {_ilike: "%/school-curriculum/%"}}
//       order_by: {amount: desc}
//       limit: 1
//     ) {
//       amount
//     }
//     upAmount: transactions_aggregate(where: {type: {_eq: "up"}}) {
//       aggregate {
//         sum {
//           amount
//         }
//       }
//     }
//     downAmount: transactions_aggregate(where: {type: {_eq: "down"}}) {
//       aggregate {
//         sum {
//           amount
//         }
//       }
//     }
//     xpAmount: transactions_aggregate(
//       where: {type: {_eq: "xp"}, _or: [{attrs: {_eq: {}}}, {attrs: {_has_key: "group"}}], _and: [{path: {_nlike: "%/piscine-js/%"}}, {path: {_nlike: "%/piscine-go/%"}}]}
//     ) {
//       aggregate {
//         sum {
//           amount
//         }
//       }
//     }
//     timeline: transactions(
//       where: {type: {_eq: "xp"}, _or: [{attrs: {_eq: {}}}, {attrs: {_has_key: "group"}}], _and: [{path: {_nlike: "%/piscine-js/%"}}, {path: {_nlike: "%/piscine-go/%"}}]}
//     ) {
//       amount
//       createdAt
//       path
//     }
//   }
// }
//   `;

//   try {
//     const response = await fetch(
//       "https://01.gritlab.ax/api/graphql-engine/v1/graphql",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${jwt}`,
//         },
//         body: JSON.stringify({ query }),
//       }
//     );

//     const data = await response.json();
//     const user = data.data.user[0];
//     displayUserInfo(user);
//     displayUserXp(
//       user.xpAmount.aggregate.sum.amount,
//       user.upAmount.aggregate.sum.amount,
//       user.downAmount.aggregate.sum.amount
//     );

//     // get the size of the timeline-container
//     const timelineContainer = document.getElementById("timeline-container");

//     // create the timeline
//     createTimeline(
//       timelineContainer.offsetWidth,
//       timelineContainer.offsetHeight,
//       data
//     );
//     //  if the window is resized, re-create the timeline
//     const firstHeight = timelineContainer.offsetHeight;
//     window.addEventListener("resize", () => {
//       createTimeline(timelineContainer.offsetWidth, firstHeight, data);
//     });
//   } catch (error) {
//     console.error("Error fetching data:", error);
//   }
// }

  