/** @jsxImportSource jsx-slack */
import {RadioButton, Modal, Header, RadioButtonGroup, Divider} from 'jsx-slack'

enum QuestionFocus {
  Specialization = "Specialization :bulb:",
  Coordination = "Coordination :dancers:",
  Credibility = "Credibility :guardsman:"
}

interface Question {
  focus : QuestionFocus,
  number : number,
  text : string,
  reversed : boolean
}

interface QuestionModalParams {
  question : Question,
  channelNames : string[]
}

export const survey : Question[] = [
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
    number: 1,
    text: "I was comfortable accepting procedural suggestions from other team members.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Credibility,
    number: 2,
    text: "I trusted that other members' knowledge about the project was credible.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Credibility,
    number: 3,
    text: "I was confident relying on the information that other team members brought to the discussion.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Credibility,
    number: 4,
    text: "When other members gave information, I wanted to double-check it for myself.",
    reversed: true 
  },
  {
    focus:  QuestionFocus.Credibility,
    number: 5,
    text: "I did not have much faith in other members' \"expertise\".",
    reversed: true 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 1,
    text: "Our team worked together in a well-coordinated fashion.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 2,
    text: "Our team had very few misunderstandings about what to do.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 3,
    text: "Our team needed to backtrack and start over a lot.",
    reversed: true 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 4,
    text: "We accomplished the task smoothly and efficiently.",
    reversed: false 
  },
  {
    focus:  QuestionFocus.Coordination,
    number: 5,
    text: "There was much confusion about how we would accomplish the task.",
    reversed: true 
  },
]

function valueIfReversed(value: number, reversed: boolean) : string {
  return reversed ? 
    (6 - value).toString() : 
    value.toString()
}

interface ReversedParam {
  reversed : boolean
}

function optionsWithValues({reversed} : ReversedParam) : any {return ( // It is not clear to me what the return type should be here
  <>
    <RadioButton value={valueIfReversed(5, reversed)}>Strongly agree</RadioButton>
    <RadioButton value={valueIfReversed(4, reversed)}>Agree</RadioButton>
    <RadioButton value={valueIfReversed(3, reversed)}>Neither agree nor disagree</RadioButton>
    <RadioButton value={valueIfReversed(2, reversed)}>Disagree</RadioButton>
    <RadioButton value={valueIfReversed(1, reversed)}>Strongly disagree</RadioButton>
  </>
)}

function channelNamesToString(channelNames: string[]): string {
  return channelNames.join(", ")
}

export const surveyModalBlock = ({question : {focus, number, text, reversed}, channelNames} : QuestionModalParams) => (
  <Modal title={`TMS survey for ${channelNamesToString(channelNames)}`} close="Previous" submit="Next">
  <Header>${focus}</Header>
  <Divider />

  <RadioButtonGroup
    label={`${number.toString()}. ${text}`}
    required
  >
    ${optionsWithValues({reversed})}
  </RadioButtonGroup>

  </Modal>
)