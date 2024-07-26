import React, {useEffect, useRef, useState} from 'react';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {
  BottomTabBar,
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Button,
  Falsy,
  RecursiveArray,
  RegisteredStyle,
  ViewStyle,
} from 'react-native';
import WebEmbed from './WebEmbed';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {prepareAssetsForStaticServer} from './PrepareAssets';
import Server from '@dr.pogodin/react-native-static-server';
import * as RNFS from '@dr.pogodin/react-native-fs';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MyStack = () => {

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="Tab" component={TabBar} />
      <Stack.Screen name="Details" component={DetailsScreen} />
    </Stack.Navigator>
  );
};

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  return (
    <View style={styles.center}>
      <Text>Home Screen</Text>
      <Button
        title="Go to Details"
        onPress={() => {
          navigation.navigate('Details');
        }}
      />
    </View>
  );
};

const DetailsScreen = () => {
  return (
    <View style={styles.center}>
      <Text>Details Screen</Text>
    </View>
  );
};

interface AcademyScreenProps {
  hide: () => void;
  show: () => void;
  baseURL: string;
}

const AcademyScreen: React.FC<AcademyScreenProps> = ({hide, show, baseURL}) => {
  return (
    <View style={styles.fullScreen}>
      <WebEmbed hideBottomBar={hide} showBottomBar={show} baseURL={baseURL} />
    </View>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <MyStack />
    </NavigationContainer>
  );
};

const TabBar = () => {
  const translateY = useRef(new Animated.Value(0)).current;
  const [showSplash, setShowSplash] = useState(false);
  const navigation = useNavigation();
  const [origin, setOrigin] = useState('');

  const hideBottomBar = () => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const showBottomBar = () => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    setShowSplash(true);
    navigation.navigate('Academy');
    setTimeout(() => {
      setShowSplash(false);
      navigation.navigate('Home');
    }, 2000);

    let path = RNFS.DocumentDirectoryPath + '/webroot';

    let server = new Server({
      // See further in the docs how to statically bundle assets into the App,
      // alernatively assets to serve might be created or downloaded during
      // the app's runtime.
      fileDir: path,
    });
    (async () => {
      // You can do additional async preparations here; e.g. on Android
      // it is a good place to extract bundled assets into an accessible
      // location.

      // Note, on unmount this hook resets "server" variable to "undefined",
      // thus if "undefined" the hook has unmounted while we were doing
      // async operations above, and we don't need to launch
      // the server anymore.

      if (server) {
        await prepareAssetsForStaticServer();
        console.log('Server starting');
        let serverURL = await server.start();
        setOrigin(serverURL);
      }
    })();

    return () => {
      setOrigin('');

      // No harm to trigger .stop() even if server has not been launched yet.
      server.stop();
    };
  }, []);

  const renderTabBar = (
    props: React.JSX.IntrinsicAttributes &
      BottomTabBarProps & {
        style?:
          | false
          | RegisteredStyle<ViewStyle>
          | Animated.Value
          | Animated.WithAnimatedObject<ViewStyle>
          | Animated.AnimatedInterpolation<string | number>
          | Animated.WithAnimatedArray<
              | ViewStyle
              | Falsy
              | RegisteredStyle<ViewStyle>
              | RecursiveArray<ViewStyle | Falsy | RegisteredStyle<ViewStyle>>
              | readonly (ViewStyle | Falsy | RegisteredStyle<ViewStyle>)[]
            >
          | null
          | undefined;
      },
  ) => (
    <Animated.View style={[styles.tabBar, {transform: [{translateY}]}]}>
      <BottomTabBar {...props} />
    </Animated.View>
  );

  const academyTabScreen = (
    <Tab.Screen
      options={{
        lazy: false,
      }}
      name="Academy">
      {() => (
        <AcademyScreen
          hide={hideBottomBar}
          show={showBottomBar}
          baseURL={origin}
        />
      )}
    </Tab.Screen>
  );

  const homeScreen = <Tab.Screen name="Home" component={HomeScreen} />;

  console.log('origin', origin);

  return (
    <View style={{flex: 1}}>
      {showSplash && (
        <View style={styles.splashScreen}>
          <Text> Loading... </Text>
        </View>
      )}
      <Tab.Navigator
        screenOptions={{
          lazy: false,
          headerShown: false,
        }}
        tabBar={props => renderTabBar(props)}>
        {homeScreen}
        {academyTabScreen}
      </Tab.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    flex: 1,
  },
  splashScreen: {
    position: 'absolute',
    backgroundColor: 'black',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default App;
