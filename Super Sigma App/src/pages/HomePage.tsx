import { Header, Home, Mrkdwn, Section } from "jsx-slack";
import { JSX } from "jsx-slack/jsx-runtime";

interface HomeProps {
    preRenderedCreateSurvey?: JSX.Element
    preRenderedSurveyDisplay?: JSX.Element
}

export const HomePage = async ({ preRenderedCreateSurvey, preRenderedSurveyDisplay }: HomeProps) => (
    <Home>
        <Header>Create a survey:</Header>
        {/* If we do not have a component to show, show a loading message.
         */}
        {preRenderedCreateSurvey ?? <Section>
            <Mrkdwn>Channels not yet loaded...</Mrkdwn>
        </Section>}
        {/* If we do not have a component to show, show a loading message.
         */}
        {preRenderedSurveyDisplay ?? <Section>
            <Mrkdwn>Surveys not yet loaded...</Mrkdwn>
        </Section>}
    </Home>
)

