import { convertToByteUnits } from "./convert_to_byte";

// Display the user XP and XP ratio in the DOM and generate the XP graph
export function displayUserXp(xpAmount: number, upAmount: number, downAmount: number): void {
    // Display the user XP
    document.getElementById(
      "total-xp"
    ).textContent = `Total XP: ${convertToByteUnits(xpAmount)}`;
    // Display the user XP ratio
    document.getElementById("xpRatio").textContent =
      "Audit Ratio: " + (upAmount / downAmount).toFixed(2);
    // Display the user given XP
    document.getElementById("upXpValue").textContent =
      "Up XP: " + convertToByteUnits(upAmount);
    // Display the user received XP
    document.getElementById("downXpValue").textContent =
      "Down XP: " + convertToByteUnits(downAmount);
  
    const totalXP = upAmount + downAmount;
    const upXp = document.getElementById("upXp");
    const downXp = document.getElementById("downXp");
    const upXpWidth = (upAmount / totalXP) * 100;
    const downXpWidth = (downAmount / totalXP) * 100;
    upXp.setAttribute("width", upXpWidth);
    upXp.setAttribute("x", 0);
    downXp.setAttribute("width", downXpWidth);
    downXp.setAttribute("x", upXpWidth);
}
  