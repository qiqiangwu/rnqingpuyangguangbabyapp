/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import {StoreProvider} from './src/store'

AppRegistry.registerComponent(appName, () => App);
