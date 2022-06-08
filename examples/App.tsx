import React from 'react';
import {Text, View} from 'react-native';

import {Colors} from 'react-native/Libraries/NewAppScreen';
import {ContentScroller} from 'react-native-content-scroller';

const App = () => {
  const isDarkMode = false;

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <View style={{backgroundColor: 'white', flex: 1, justifyContent: 'center'}}>
      <ContentScroller
        messages={[
          <View style={{height: 25, backgroundColor: 'blue'}}>
            <Text>Hello!</Text>
          </View>,
          <View style={{height: 25, backgroundColor: 'red'}}>
            <Text>There!</Text>
          </View>,
        ]}
        numberOfMessagesToDisplay={2}
        rotationInterval={2500}
      />
    </View>
  );
};

export default App;
