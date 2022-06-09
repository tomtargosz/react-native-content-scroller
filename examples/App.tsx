import React from 'react';
import {Text, View} from 'react-native';
import {ContentScroller} from 'react-native-content-scroller';

const App = () => {
  return (
    <View style={{backgroundColor: 'white', flex: 1, justifyContent: 'center'}}>
      <ContentScroller
        messages={[
          <View
            style={{
              height: 100,
              backgroundColor: 'blue',
              justifyContent: 'center',
            }}>
            <Text>One</Text>
          </View>,
          <View
            style={{
              height: 100,
              backgroundColor: 'green',
              justifyContent: 'center',
            }}>
            <Text>Two</Text>
          </View>,
          <View
            style={{
              height: 100,
              backgroundColor: 'red',
              justifyContent: 'center',
            }}>
            <Text>Three</Text>
          </View>,
        ]}
        numberOfMessagesToDisplay={3}
        rotationInterval={1500}
      />
    </View>
  );
};

export default App;
