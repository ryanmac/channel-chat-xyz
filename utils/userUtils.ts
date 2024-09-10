// utils/userUtils.ts
import { isUsernameTaken, updateUser } from "@/lib/user";

export async function generateUniqueUsername(username: string) {
  if (username && !(await isUsernameTaken(username))) {
    return username;
  }

  const number = Math.floor(Math.random() * 100);
  let newUsername = generateUsername();

  while (await isUsernameTaken(newUsername)) {
    newUsername = generateUsername();
    if (await isUsernameTaken(newUsername)) {
      newUsername = `${newUsername}${number}`;
    }
  }

  return newUsername;
}

const adjectives = [
  "Happy", "Sleepy", "Grumpy", "Sneezy", "Dopey", "Bashful", "Doc",
  "Witty", "Silly", "Clever", "Brave", "Mighty", "Swift", "Wise", 
  "Sparkling", "Jolly", "Giggly", "Bouncy", "Fuzzy", "Glimmering", 
  "Daring", "Majestic", "Epic", "Cosmic", "Wild", "Cheerful", 
  "Mystic", "Invisible", "Fearless", "Radiant", "Charming", "Galactic", 
  "Playful", "Glowing", "Curious", "Fantastic", "Heroic", "Epic", 
  "Sneaky", "Friendly", "Turbo", "Zooming", "Quantum", "Pixelated",
  "Electric", "Dazzling", "Blazing", "Thundering", "Roaring", "Fluffy", 
  "Bubbly", "Rainbow", "Zany", "Funky", "Twinkling", "Peppy", "Whirling", 
  "Breezy", "Sunny", "Mysterious", "Gentle", "Gutsy", "Snazzy", 
  "Super", "Mega", "Ultra", "Hyper", "Chilly", "Frosty", "Luminous", 
  "Energetic", "Lively", "Breezy", "Hyperactive", "Chirpy", "Zoomy", 
  "Booming", "Speedy", "Wacky", "Cosmic", "Celestial", "Astral"
];

const nouns = [
  "Panda", "Tiger", "Elephant", "Giraffe", "Penguin", "Koala", "Lion",
  "Eagle", "Dolphin", "Wizard", "Ninja", "Pirate", "Astronaut", "Dragon",
  "Phoenix", "Unicorn", "Robot", "Knight", "Captain", "Jedi", "Samurai",
  "Mermaid", "Alien", "Elf", "Viking", "Pirate", "Ranger", "Guardian",
  "Superhero", "Gnome", "Monster", "Yeti", "Explorer", "Inventor", 
  "Chameleon", "Octopus", "Penguin", "Rocketeer", "Ninja", "Goblin", 
  "Starship", "Zebra", "Magician", "Sorcerer", "Gryphon", "Pixie", 
  "Cyborg", "Astronomer", "Llama", "Shark", "Panther", "Puppy", "Kitten",
  "Cheetah", "Falcon", "Koala", "Whale", "Starfish", "Wizard", "Sorcerer",
  "TimeTraveler", "Detective", "Knight", "Juggler", "Comet", "Meteor", 
  "Thunderbird", "Spaceman", "NinjaWarrior", "PirateQueen", "GalaxyHero",
  "Mantis", "Seahorse", "Platypus", "PheonixFire", "ThunderDragon", 
  "NeonTiger", "SkySurfer", "OceanDiver", "Starlight", "ShadowHunter", 
  "SilverArrow", "GoldenFleece", "DreamWalker", "NightOwl", "Daydreamer",
  "Alpha", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf", "Hotel",
  "India", "Juliet", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa",
  "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey",
  "Xray", "Yankee", "Zulu"
];

export function generateUsername(): string {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];

  return `${adjective}${noun}`;
}

export async function ensureUsername(user: any) {
  if (!user.username) {
    let username = generateUsername();
    username = await generateUniqueUsername(username);
    await updateUser(user.id, { username });
    return { ...user, username };
  }
  return user;
}