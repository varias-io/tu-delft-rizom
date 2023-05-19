import { Divider, Header, Home, JSXSlack, Mrkdwn, Option, Select,  } from 'jsx-slack';
import { app, getUsersFromChannels, sendDM } from './utils/index.js';
import { CustomActions2, SurveyData } from './components/CustomActions.js';
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
          <Select multiple label='Select Channel(s)'><Option > <Mrkdwn>Foo channel</Mrkdwn> </Option></Select>
          <CustomActions2/> 
          <Header> Active Surveys</Header>
          <Divider />
          <SurveyData surveys = 
          {[new Survey("foo", "1", 1, 2, 3, new Date(2021, 1, 1)), new Survey("bar", "2", 1, 2, 3, new Date(2021, 1, 1))].sort(function(a, b) {
            return a.channel_Name.localeCompare(b.channel_Name);
          })}/>
        </Home>
      )
    })
  }
})


console.log('⚡️ Bolt app is running!');
