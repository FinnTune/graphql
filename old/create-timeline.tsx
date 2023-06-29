// import * as d3 from 'd3';
// import { convertToByteUnits } from "./convert_to_byte";
// import type { Data } from "@/app/custom.d.ts";

// export function createTimeline(thicc: number, smoll: number, data: Data): void {
//     // remove the previous timeline
//     d3.select("#timeline").selectAll("*").remove();
//     d3.select(".tooltip").remove();
  
//     // sort the timeline data by date
//     data.data.user[0].timeline.sort(
//         (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//     );
//     // get the start and end date of the timeline
//     const startDate = new Date(data.data.user[0].timeline[0].createdAt);
//     const endDate = new Date(
//       data.data.user[0].timeline[data.data.user[0].timeline.length - 1].createdAt
//     );
  
//     // set the start and end date to the first and last day of the month in order to get the correct width of the timeline
//     startDate.setDate(1);
//     startDate.setHours(0, 0, 0, 0);
//     endDate.setDate(1);
//     endDate.setMonth(endDate.getMonth() + 1);
//     endDate.setHours(0, 0, 0, 0);
  
//     // set the margins and width and height of the timeline
//     const margin = { top: 10, right: 40, bottom: 30, left: 40 },
//       width = thicc - margin.left - margin.right - 100,
//       height = smoll - margin.top - margin.bottom - 40;
  
//     // create a new svg element with the width and height of the timeline-container
//     const svg = d3
//       .select("#timeline")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);
  
//     const x = d3.scaleTime().domain([startDate, endDate]).range([0, width]);

//     if (thicc < 800 && thicc > 600) {
//         const xAxis = d3.axisBottom(x)
//         .ticks(d3.timeMonth.every(1))
//         .tickFormat((domainValue: any, index: number) => {
//             if (typeof domainValue === "number") {
//             domainValue = new Date(domainValue);
//             }
//             return d3.timeFormat("%b %Y")(domainValue);
//     });

//     svg.append("g")
//     .attr("transform", `translate(0, ${height})`)
//     .call(xAxis);

//     } else if (thicc < 600 && thicc >= 500) {
//         const xAxis = d3.axisBottom(x)
//       svg
//         .append("g")
//         .attr("transform", `translate(0, ${height})`)
//         .call((xAxis as any))
//             .ticks(d3.timeMonth.every(1))
//             .tickFormat(d3.timeFormat("%b %y"))
//         );
//     } else if (thicc < 500 && thicc > 0) {
//       svg
//         .append("g")
//         .attr("transform", `translate(0, ${height})`)
//         .call(
//           d3
//             .axisBottom(x)
//             .ticks(d3.timeMonth.every(1))
//             .tickFormat(d3.timeFormat("%b"))
//         );
//     } else {
//       svg
//         .append("g")
//         .attr("transform", `translate(0, ${height})`)
//         .call(
//           d3
//             .axisBottom(x)
//             .ticks(d3.timeMonth.every(1))
//             .tickFormat(d3.timeFormat("%B %Y"))
//         );
//     }
  
//     const tooltip = d3
//       .select("body")
//       .append("div")
//       .attr("class", "tooltip")
//       .style("opacity", 0)
//       .style("left", "50%") // Set initial left position
//       .style("top", "0"); // Set initial top position
  
//     const mergeOverlappingDots = (data) => {
//       let mergedData = [];
//       let tempData = [];
  
//       data.forEach((item, i) => {
//         if (i === 0) {
//           tempData.push(item);
//         } else if (
//           Math.abs(
//             x(new Date(data[i - 1].createdAt)) - x(new Date(item.createdAt))
//           ) < 6
//         ) {
//           tempData.push(item);
//         } else {
//           mergedData.push(tempData);
//           tempData = [item];
//         }
//       });
  
//       mergedData.push(tempData);
//       return mergedData;
//     };
  
//     const mergedData = mergeOverlappingDots(data.data.user[0].timeline);
  
//     const colorScale = d3
//       .scaleLinear()
//       .domain([0, d3.max(data.data.user[0].timeline, (d) => d.amount)])
//       .range(["#3366cc", "#cc3366"]);
  
//     svg
//       .selectAll(".dot")
//       .data(mergedData)
//       .enter()
//       .append("circle")
//       .attr("class", "dot")
//       .attr("r", (d) => 5)
//       .attr("cx", (d) => x(new Date(d[0].createdAt)))
//       .attr("cy", height)
//       .attr("fill", (d) => colorScale(d[0].amount)) // Fill dots with color based on amount
//       .on("mouseover", function (event, d) {
//         tooltip.transition().duration(200).style("opacity", 0.9);
  
//         let tooltipHtml = "";
  
//         // Group projects by date
//         let dateGroupedProjects = d.reduce((group, project) => {
//           let date = d3.timeFormat("%B %d, %Y")(new Date(project.createdAt));
//           if (!group[date]) group[date] = [];
//           group[date].push(project);
//           return group;
//         }, {});
  
//         // Generate tooltip HTML
  
//         for (let date in dateGroupedProjects) {
//           tooltipHtml += `${date}<br/>`;
//           tooltipHtml += dateGroupedProjects[date]
//             .map(
//               (project) =>
//                 `${project.path.split("/").pop()}<br/>${convertToByteUnits(
//                   project.amount
//                 )}` // Display project name and XP
//             )
//             .join("<br/>");
//           tooltipHtml += "<br/>";
//         }
  
//         tooltip
//           .html(tooltipHtml)
//           .style("left", event.pageX + "px")
//           .style("top", event.pageY - 28 + "px");
//       })
  
//       .on("mouseout", function (d) {
//         tooltip.transition().duration(500).style("opacity", 0);
//     });
// }