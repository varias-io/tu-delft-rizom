import { Divider, Header, Home, JSXSlack, Option, Select,  } from 'jsx-slack';
import { app, entityManager } from './utils/index.js';
import { SurveyData } from './components/SurveyDisplay.js';
import { Survey } from './entity/Survey.js';

// Start your app
await app.start(process.env.PORT || 9000);

app.event("app_home_opened", async ({context, payload}) => {
  if (payload.tab == "home") {
    app.client.views.publish({
      user_id: payload.user,
      token: context.botToken ?? "",
      view: JSXSlack(
        <Home>
          <Header>{(await app.client.users.info({user: payload.user, token: context.botToken ?? ""})).user?.real_name}</Header>
          <Header>TMS Surveys</Header>
          <Select multiple label='Select Channel(s)'><Option > Foo channel </Option></Select>
          <Header> Active Surveys</Header>
          <Divider />
          <SurveyData surveys = 
          {[entityManager.create(Survey, {channelName: "foo", completedAmount: 1, participants: 2, TMSScore: 3, date: new Date(2021, 1, 1)}), entityManager.create(Survey, {channelName: "bar", completedAmount: 1, participants: 2, TMSScore: 3, date: new Date(2021, 1, 1)})].sort(function(a, b) {
            return a.channelName.localeCompare(b.channelName);
          })}/>
        </Home>
      )
    })
  }
})


console.log('⚡️ Bolt app is running!');
