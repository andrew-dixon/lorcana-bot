import 'dotenv/config';
import express from 'express';
import axios from 'axios';
import {
  InteractionType,
  InteractionResponseType,
  MessageComponentTypes,
  ButtonStyleTypes,
} from 'discord-interactions';
import { 
  VerifyDiscordRequest, 
  name_convert,
  generate_card_embed 
} from './utils.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ verify: VerifyDiscordRequest(process.env.PUBLIC_KEY) }));

app.post('/interactions', async function (req, res) {
  const { type, id, data } = req.body;

  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    if (name === 'card') {
      const input_value = req.body.data.options[0].value;
      //let lorcana_api_search_response = await axios.get( 'https://api.lorcana-api.com/fuzzytest2/' + input_value );
      let lorcana_api_search_response = await axios.get( 'https://api.lorcana-api.com/search?name~' + input_value );
      let cards = lorcana_api_search_response.data;
      if (cards.length > 1) {
        let buttons = [];
        for (let card in cards) {
          buttons.push(
            {
              type: MessageComponentTypes.BUTTON,
              custom_id: `${cards[card]}_button_${req.body.id}`,
              label: `${name_convert(cards[card])}`,
              style: ButtonStyleTypes.PRIMARY,
            }
          )            
        }
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            content: `Pick a card to see it's full details`,
            components: [
              {
                type: MessageComponentTypes.ACTION_ROW,
                components: buttons
              }
            ]
          },
        });
      } else if (cards.length == 1) {
        let card_name = cards[0];
        let lorcana_api_card_response = await axios.get( 'https://api.lorcana-api.com/strict/' + card_name );
        let card = lorcana_api_card_response.data;
        let embeds = [ generate_card_embed( card ) ];
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            "embeds": embeds
          },
        });
      } else {
        return res.send({
          type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
          data: {
            "content": '**Nothing found for:** ' + objectName
          },
        });
      }
    }
  }

  if (type === InteractionType.MESSAGE_COMPONENT) {
    const componentId = data.custom_id;
    let card_name = componentId.split('_button_')[0];
    let lorcana_api_card_response = await axios.get( 'https://api.lorcana-api.com/strict/' + card_name );
    let card = lorcana_api_card_response.data;
    let embeds = [ generate_card_embed( card ) ];
    return res.send({
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        "embeds": embeds
      },
    });
  }

});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});
