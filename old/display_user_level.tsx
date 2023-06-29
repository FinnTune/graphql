export function displayUserLevel(level: number): string {
    // if the user is between level 0 -10 return a string containing the level followed by "Aspiring Developer"
    if (level >= 0 && level < 10) {
      return `Level ${level} Aspiring Developer`;
    }
    if (level >= 10 && level < 20) {
      return `Level ${level} Beginner Developer`;
    }
    if (level >= 20 && level < 30) {
      return `Level ${level} Apprentice Developer`;
    }
    if (level >= 30 && level < 40) {
      return `Level ${level} Assistant Developer`;
    }
    if (level >= 40 && level < 50) {
      return `Level ${level} Basic Developer`;
    }
    if (level >= 50 && level < 60) {
      return `Level ${level} Junior Developer`;
    } else {
      return `Level ${level}`;
    }
}