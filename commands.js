import 'dotenv/config';
import axios from 'axios';
import { InstallGlobalCommands , name_convert } from './utils.js';

const CARD_COMMAND = {
  name: 'card',
  description: 'Search for a card',
  options: [
    {
      type: 3,
      name: 'name',
      description: 'Enter the name of the card you want to search for',
      required: true,
    },
  ],
  type: 1,
};

const ALL_COMMANDS = [CARD_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);