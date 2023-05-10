/** @jsxImportSource jsx-slack */
import { jsxslack } from 'jsx-slack'

enum QuestionFocus {
  Specialization = "Specialization :bulb:",
  Coordination = "Coordination :dancers:",
  Credibility = "Credibility :guardsman:"
}

interface Question {
  focus : QuestionFocus
  number : number
  text : string
  reversed : boolean
}

const valueIfReversed = (value: number, reversed: boolean) => reversed ? 6 - value : value

const optionsWithValues = (reversed : boolean) => jsxslack`
  <>
    <RadioButton value="${valueIfReversed(5, reversed)}">Strongly agree</RadioButton>
    <RadioButton value="${valueIfReversed(4, reversed)}">Agree</RadioButton>
    <RadioButton value="${valueIfReversed(3, reversed)}">Neither agree nor disagree</RadioButton>
    <RadioButton value="${valueIfReversed(2, reversed)}">Disagree</RadioButton>
    <RadioButton value="${valueIfReversed(1, reversed)}">Strongly disagree</RadioButton>
  </>
`

export const surveyModalBlock = (question : Question) => jsxslack`
  <Modal title="Workplace check-in" close="Previous" submit="Next">
  <Header>${question.focus}</Header>
  <Divider />

  <RadioButtonGroup
    label="${question.number}. ${question.text}"
    required
  >
    ${optionsWithValues(question.reversed)}
  </RadioButtonGroup>

  </Modal>
`