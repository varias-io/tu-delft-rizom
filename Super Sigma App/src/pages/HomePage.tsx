import { Home, Header, Divider, Section, Button, Actions, Image } from "jsx-slack";
import { ChannelSelect } from "../components/ChannelSelect.js";
import { CreateSurvey } from "../components/CreateSurvey.js";
import { SurveyData } from "../components/SurveyDisplay.js";
import { Survey } from "../entity/Survey.js";
import { entityManager } from "../utils/database.js";
import { MembersSelect } from "../components/MembersSelect.js";

interface HomeProps {
    userId: string
    token: string
    selectedChannel?: string
}

import CanvasRenderService from 'chartjs-node-canvas';

const width = 1000;   // define width and height of canvas 
const height = 1000;   
const canvasRenderService = new CanvasRenderService.ChartJSNodeCanvas({
    width,
    height
});


const createImage1 = async () => {
  const dataUrl = await canvasRenderService.renderToDataURL({
    type: "bar",
    data: {
        labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
        datasets: [
            {
                label: 'Retweets',
                data: [12, 5, 40, 5],
                backgroundColor: '#9BD0F5',
            },
            {
                label: 'Likes',
                data: [80, 42, 215, 30],
                backgroundColor: '#FF6384',
            },
        ],
    },
  }); // converts chart to image
  return dataUrl;
}

const createImage2 = async () => {
    const dataUrl = await canvasRenderService.renderToDataURL({
        type: "line",
        data: {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'My First dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    borderColor: '#9BD0F5',
                    backgroundColor: '#9BD0F5',
                    tension: 0.1
                },
            ]
        }
    })
    return dataUrl
}

const barChart = createImage1() ?? "";
const lineChart = createImage2() ?? "";

import {writeFile} from "node:fs/promises"

writeFile("./src/assets/barChart.png", (await barChart).replace(/^data:image\/png;base64,/, ""), "base64")
writeFile("./src/assets/lineChart.png", (await lineChart).replace(/^data:image\/png;base64,/, ""), "base64")

export const HomePage = async ({userId, token, selectedChannel}: HomeProps) => (
    <Home>
        <Header>Welcome back to my home! :house_with_garden:</Header>
        <Header>Make members Channel Managers here:</Header>
        <Divider/>
        <Section><b>Select a channel</b></Section>
        {await ChannelSelect({userId, token})}
        {(selectedChannel && 
            <>
                {await MembersSelect(selectedChannel, token)}
                <Actions><Button style="primary" actionId="makeManager">Authorize</Button></Actions>
            </>
        )
        || <></>}
        <Divider/>
        <Header>Create a survey:</Header>
        {await CreateSurvey({userId, token})}
        <SurveyData surveys = 
        {[entityManager.create(Survey, {channelName: "foo", completedAmount: 1, participants: 2, TMSScore: 3, date: new Date(2021, 1, 1)}), entityManager.create(Survey, {channelName: "bar", completedAmount: 1, participants: 2, TMSScore: 3, date: new Date(2021, 1, 1)})].sort(function(a, b) {
        return a.channelName.localeCompare(b.channelName);
        })}/>
        <Image src="https://ilse.rizom.test.varias.dev/table.jpeg" alt="TABLE" />
        <Image src="https://ilse.rizom.test.varias.dev/barChart.png" alt="chart" />  
        <Image src="https://ilse.rizom.test.varias.dev/lineChart.png" alt="chart" />  
        </Home>
)

