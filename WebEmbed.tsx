import React, {useRef, useState} from 'react';
import {WebView} from 'react-native-webview/src';
import {WebViewMessageEvent} from 'react-native-webview';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

interface WebEmbedProps {
  hideBottomBar: () => void;
  showBottomBar: () => void;
}

const WebEmbed: React.FC<WebEmbedProps> = React.memo(
  ({hideBottomBar, showBottomBar}) => {
    const [backgroundColor, setBackgroundColor] = useState('#1E2022');
    const [isLoading, setIsLoading] = useState(true);
    const webViewRef = useRef(null);

    interface MessageData {
      action?: string;
      value?: string;
    }

    const onMessage = async (event: WebViewMessageEvent) => {
      let data: MessageData;

      try {
        data = JSON.parse(event.nativeEvent.data);
      } catch (error) {
        console.log('Received non-JSON message');
        return;
      }

      if (data.action) {
        switch (data.action) {
          case 'open_submenu':
            hideBottomBar();
            break;
          case 'close_submenu':
            showBottomBar();
            break;
          case 'open_chapter':
            setBackgroundColor('#FFFC107');
            hideBottomBar();
            break;
          case 'close_chapter':
            setBackgroundColor('#1E2022');
            showBottomBar();
            break;
          case 'open_subchapter':
            setBackgroundColor('#FFFC107');
            break;
          case 'close_subchapter':
            setBackgroundColor('#1E2022');
            break;
          case 'finish_intial_loading':
            setIsLoading(false);
            break;
          case 'launch_url':
            const url = data.value;
            if (url !== undefined) {
              // TODO: Add launch URL logic here
            }
            break;
          case 'claim_reward':
            const lnurl = data.value;
            if (lnurl !== undefined) {
              console.log('Received LNURL: ' + lnurl);
              // TODO: Add receive lightning invoice logic here
            }
            break;
        }
      }
    };

    const sendBackMessage = () => {
      if (webViewRef?.current) {
        webViewRef.current.injectJavaScript(`
          window.postMessage('${JSON.stringify({
            action: 'navigation_go_back',
          })}', '*');
        `);
      }
    };

    const userID = '1234'; //Only for presentation purpose

    return (
      <View style={{flex: 1, backgroundColor: backgroundColor}}>
        <SafeAreaView style={{flex: 1}}>
          <View style={styles.container}>
            {/* {isLoading && (
              <View style={styles.loadingScreen}>
                <ActivityIndicator color={'white'} />
                <Text style={{color: 'white', paddingTop: 24}}>
                  Loading latest education pieces{' '}
                </Text>
              </View>
            )} */}
            <WebView
              ref={webViewRef}
              source={{
                uri: 'https://test-app-2ae8b.web.app',
              }}
              onMessage={onMessage}
              startInLoadingState={false}
              onLoadStart={() => {
                console.log('Loading started');
              }}
              style={{backgroundColor: 'black', flex: 1}}
              onLoadProgress={() => {
                console.log('Loading Progress');
              }}
              onLoad={() => {
                console.log('On Loading');
              }}
              javaScriptEnabled={true}
              cacheEnabled={true}
              injectedJavaScript={`
                            (function() {
                            if (!window.hasReactNativeWebViewListener) {
                            const originalConsoleLog = console.log;
                            console.log = function(...args) {
                                window.ReactNativeWebView.postMessage(JSON.stringify(args));
                                originalConsoleLog.apply(console, args);
                            };

                            window.addEventListener('message', function(event) {
                                window.ReactNativeWebView.postMessage(event.data);
                            });
                            window.hasReactNativeWebViewListener = true;
                            }
                            })();
                        `}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E2022',
  },
  loadingScreen: {
    position: 'absolute',
    backgroundColor: '#1E2022',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9,
  },
});

export default WebEmbed;
