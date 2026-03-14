
import { Residential } from "./buildings.js";
import { Job } from "./job.js";

class Person {
  constructor(age, gender, home, job) {
    this.age = age;
    this.gender = gender;
    this.home = home;
    this.job = job;
    this.family = {
      parents: [],
      spouse: null,
      kids: []
    };
  }
}

export { Person };
