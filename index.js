/**
 * @format
 */

import 'react-native-gesture-handler';
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

// This line registers the main App component with the native side.
// appName comes from the app.json file (e.g., "AutomonX_app")
// The second argument is a function that returns the component to load.
AppRegistry.registerComponent('main', () => App);
