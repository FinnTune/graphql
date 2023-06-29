export function calculateAge(dateOfBirthStr: string): number {
    const dob = new Date(dateOfBirthStr);
    const diffMs = Date.now() - dob.getTime();
    const ageDate = new Date(diffMs); // milliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970); // subtract 1970 to get the age in years
}