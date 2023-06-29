import { displayUserLevel } from "./display_user_level";
import { calculateAge } from "./calculate_age";
import type { User } from "@/app/custom.d.ts";

export function displayUserInfo(user: User): void {
    // Set the title of the page to the username of the user
    document.title = `${user.login}s Profile`;
    // Set the user image
    document.querySelector(".user-image").src = user.attrs.image;
    // set the user name
    document.getElementById(
      "name-profile"
    ).textContent = ` ${user.login}s Profile`;
    // Set the user phone number
    document.getElementById("phone").textContent = ` ${user.attrs.phonenumber}`;
    //  set the user email
    document.getElementById("email").textContent = ` ${user.attrs.email}`;
    // set the user first name and last name
    document.getElementById(
      "first-name-last-name"
    ).textContent = ` ${user.attrs.firstName} ${user.attrs.lastName}`;
    // set the user campus
    document.getElementById("campus").textContent = ` ${displayUserLevel(
      user.level[0].amount
    )} at ${user.campus}`;
    // set the user age and country
    document.getElementById("from").textContent = `${calculateAge(
      user.attrs.dateOfBirth
    )} Years old from ${user.attrs.country}`;
  }