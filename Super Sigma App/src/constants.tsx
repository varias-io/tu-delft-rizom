export enum QuestionFocus {
  Specialization = "Specialization :bulb:",
  Coordination = "Coordination :dancers:",
  Credibility = "Credibility :guardsman:"
}

export interface Question {
  focus : QuestionFocus,
  number : number,
  text : string,
  reversed : boolean
}

export const surveyTemplate : Question[] = [
  {
    focus:  QuestionFocus.Specialization,
    number: 1,
    text: "Each team member has specialized knowledge of some aspect of our project.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Specialization,
    number: 2,
    text: "I have knowledge about an aspect of the project that no other team member has.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Specialization,
    number: 3,
    text: "Different team members are responsible for expertise in different areas.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Specialization,
    number: 4,
    text: "The specialized knowledge of several different team members was needed to complete the project deliverables.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Specialization,
    number: 5,
    text: "I know which team members have expertise in specific areas.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Credibility,
    number: 6,
    text: "I was comfortable accepting procedural suggestions from other team members.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Credibility,
    number: 7,
    text: "I trusted that other members' knowledge about the project was credible.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Credibility,
    number: 8,
    text: "I was confident relying on the information that other team members brought to the discussion.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Credibility,
    number: 9,
    text: "When other members gave information, I wanted to double-check it for myself.",
    reversed: true 
  },
  {
    focus:  QuestionFocus.Credibility,
    number: 10,
    text: "I did not have much faith in other members' \"expertise\".",
    reversed: true 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 11,
    text: "Our team worked together in a well-coordinated fashion.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 12,
    text: "Our team had very few misunderstandings about what to do.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 13,
    text: "Our team needed to backtrack and start over a lot.",
    reversed: true 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 14,
    text: "We accomplished the task smoothly and efficiently.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 15,
    text: "There was much confusion about how we would accomplish the task.",
    reversed: true 
  },
]