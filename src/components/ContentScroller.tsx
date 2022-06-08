import * as React from "react";
import { Dimensions } from "react-native";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import update from "immutability-helper";

type Props = {
  messages: Array<React.ReactElement>;
  numberOfMessagesToDisplay: number;
  rotationInterval: number;
  children?: React.ReactChild;
};

// We initially set the view height to the height of the device to ensure we get an
// accurate measurement of the views inside of the componet
const STARTING_VIEW_HEIGHT = Dimensions.get("window").height;

export function ContentScroller(props: Props) {
  React.useEffect(() => {
    if (props.numberOfMessagesToDisplay > props.messages.length) {
      console.warn(
        "Having numberOfMessagesToDisplay greater than messages.length will break the UI"
      );
    }
  }, []);

  // We initially set the messages array to two copies of props.messages so we're
  // able to cycle through all the messages once and still display all of them
  const [messages, setMessages] = React.useState([
    ...props.messages,
    ...props.messages,
  ]);
  const [messagesSeen, setMessagesSeen] = React.useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = React.useState(0);
  const [textHeight, setTextHeight] = React.useState<null | number>(null);
  const [messageHeights, setMessageHeights] = React.useState<Array<number>>([]);
  const messageHeightsSum = React.useMemo(
    () =>
      messageHeights.slice(0, props.messages.length).reduce((a, b) => a + b, 0),
    [messageHeights]
  );
  const rotatorViewHeight = React.useMemo(
    () =>
      messageHeights
        .slice(0, props.numberOfMessagesToDisplay)
        .reduce((a, b) => a + b, 0),
    [messageHeights]
  );

  const offset = useSharedValue(0);
  const derivedContainerOpacity = useDerivedValue(() => {
    return textHeight ? withTiming(1, { duration: 200 }) : 0;
  }, [textHeight]);

  const increment = (_finished?: boolean) => {
    if (messagesSeen >= props.messages.length - 1) {
      // Once a user has seen all of the messages one time we set offset.value to its original
      // height and reset the messages array to two copies of props.messages. This makes
      // it so that we're able to continually cycle through elements without
      // adding an infinite amount of views which would eventually crash the app
      offset.value = offset.value + messageHeightsSum;
      setMessages([...props.messages, ...props.messages]);

      setCurrentMessageIndex(0);
      setMessagesSeen(0);
    } else {
      setMessagesSeen(messagesSeen + 1);
    }
  };

  React.useEffect(() => {
    const interval = setInterval(() => {
      offset.value = withTiming(
        offset.value - messageHeights[currentMessageIndex],
        { duration: 500 },
        (finished) => {
          return runOnJS(increment)(finished);
        }
      );
      setCurrentMessageIndex((curr) => curr + 1);
    }, props.rotationInterval);
    return () => {
      clearInterval(interval);
    };
  }, [textHeight, messagesSeen, messages, currentMessageIndex, messageHeights]);

  const containerTransformStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: offset.value }],
    };
  });

  const containerViewOpacity = useAnimatedStyle(() => {
    return {
      opacity: derivedContainerOpacity.value,
    };
  });

  return (
    <Animated.View style={containerViewOpacity}>
      {props.children}
      <Animated.View
        style={{
          // This ensures that all necessary views have been measured so there will be no flickering upon
          // setting the opacity to 1
          height:
            messageHeights.length >= props.messages.length
              ? rotatorViewHeight
              : STARTING_VIEW_HEIGHT,
          alignItems: "center",
          alignSelf: "center",
          overflow: "hidden",
        }}
      >
        {messages.map((message, i) => (
          <Animated.View
            key={i}
            style={[
              {
                // The (i === 0 && currentMessageIndex !== i + 1) check ensures that we apply an
                // opacity of 1 to the top message when the messages array is reset to avoid any flickering.
                // The second portion of the check is there to not force that opacity once the messages begin
                // to move- without it, we'll have two messages with an opacity of 1 at the same time.
                opacity:
                  (i === 0 && currentMessageIndex !== i + 1) ||
                  currentMessageIndex === i
                    ? 1
                    : 0.25,
              },
              containerTransformStyle,
            ]}
            onLayout={(e) => {
              !textHeight && setTextHeight(e.nativeEvent.layout.height);
              !messageHeights[i] &&
                setMessageHeights(
                  update(messageHeights, {
                    [i]: { $set: e.nativeEvent.layout.height },
                  })
                );
            }}
          >
            {message}
          </Animated.View>
        ))}
      </Animated.View>
    </Animated.View>
  );
}
