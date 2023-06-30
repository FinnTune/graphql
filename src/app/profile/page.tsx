'use client'

import { useEffect } from "react";
import { createTimeline, displayUserInfo, displayUserXp } from "@/lib/profile"

export default async function Profile() {


useEffect(() => {
  async function fetchData() {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) {
    window.location.href = "/";
    return;
  }

  const query = `
    {
  user {
    login
    attrs
    campus
    level: transactions(
      where: {type: {_eq: "level"}, path: {_ilike: "%/school-curriculum/%"}}
      order_by: {amount: desc}
      limit: 1
    ) {
      amount
    }
    upAmount: transactions_aggregate(where: {type: {_eq: "up"}}) {
      aggregate {
        sum {
          amount
        }
      }
    }
    downAmount: transactions_aggregate(where: {type: {_eq: "down"}}) {
      aggregate {
        sum {
          amount
        }
      }
    }
    xpAmount: transactions_aggregate(
      where: {type: {_eq: "xp"}, _or: [{attrs: {_eq: {}}}, {attrs: {_has_key: "group"}}], _and: [{path: {_nlike: "%/piscine-js/%"}}, {path: {_nlike: "%/piscine-go/%"}}]}
    ) {
      aggregate {
        sum {
          amount
        }
      }
    }
    timeline: transactions(
      where: {type: {_eq: "xp"}, _or: [{attrs: {_eq: {}}}, {attrs: {_has_key: "group"}}], _and: [{path: {_nlike: "%/piscine-js/%"}}, {path: {_nlike: "%/piscine-go/%"}}]}
    ) {
      amount
      createdAt
      path
    }
  }
}
  `;

    fetch(
      "https://01.gritlab.ax/api/graphql-engine/v1/graphql",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ query }),
      }
    ).then(res => res.json()
    ).then(
      data => {
        const user = data.data.user[0];

        displayUserInfo(user);
        displayUserXp(
        user.xpAmount.aggregate.sum.amount,
        user.upAmount.aggregate.sum.amount,
        user.downAmount.aggregate.sum.amount
      );
  
      // get the size of the timeline-container
      const timelineContainer = document.getElementById("timeline-container");

      if (timelineContainer) {
          createTimeline(
              1000,
              110,
              data
          );
      } else {
          console.warn("Couldn't find element with ID 'timeline-container'.");
      }
      }
    ).catch(err => console.log(err))

    // const user = data.data.user[0];
  }

  fetchData();
}, []);



  const content = (
    <>
      <div className="flex min-h-screen flex-col items-center p-10">
      <h1 id="name-profile" className="my-4">Profile</h1>
      <section className="profile-info">
        <h2 id="first-name-last-name" className="my-4">Name</h2>
        <p id="email" className="my-4">Email</p>
        <p id="from" className="my-4">From</p>
        <p id="phone" className="my-4">Phone</p>
      </section>
      <section className="profile-info">
        <div id="text-info">
          <h3 id="campus">Campus</h3>
        </div>
      </section>
      <section className="profile-info">
        <p id="total-xp">total xp</p>
      </section>
      <section className="profile-info">
        <div className="user-image-container">
          <img alt="User Image" id="user-image" />
        </div>
      </section>
      <section className="statistics">
        <h2>Statistics</h2>
        <div className="xp-widget">
          <div className="xp-container">
            <div className="xp-ratio-display" id="xpRatio"></div>
            <div className="xp-values-display">
              <div className="xp-value">
                <p className="xp-value-label" id="upXpValue">Up XP:</p>
              </div>
              <div className="xp-value">
                <p className="xp-value-label" id="downXpValue">Down XP:</p>
              </div>
            </div>
            <div className="xp-visualization">
              <svg
                className="xp-svg"
                viewBox="0 0 100 20"
                preserveAspectRatio="none"
              >
                <rect
                  className="xp-bar xp-up"
                  id="upXp"
                  x="0"
                  y="0"
                  width="50"
                  height="20"
                />
                <rect
                  className="xp-bar xp-down"
                  id="downXp"
                  x="50"
                  y="0"
                  width="50"
                  height="20"
                />
              </svg>
            </div>
          </div>
        </div>
      </section>
      <section className="statistics">
        <script src="https://d3js.org/d3.v7.min.js" async />
        <div id="timeline-container">
          <svg id="timeline"></svg>
        </div>
      </section>
      </div>
    </>
  )
    return(content)
}