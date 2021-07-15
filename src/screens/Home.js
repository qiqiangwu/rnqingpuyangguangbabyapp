import React from 'react';
import {
  View,
  Image,
  Text,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Animated,
  FlatList,
  TouchableOpacity,
  StatusBar,
  NativeModules,
  Platform,
  Dimensions,
} from 'react-native';

import {queryChildrenColumnById, serverPath} from '../api';
import {COLORS, FONTS, SIZES} from '../constants';
import {ListComponent} from '../components';
import {useDispatchStore, useStateStore} from '../store';

const homeColumnId = 1272;
const mainNavCols = 4;

const {StatusBarManager} = NativeModules;

export default function Home({navigation}) {
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const [isLoading, setIsLoading] = React.useState(true);
  const [homeData, setHomeData] = React.useState(null);

  const dispatch = useDispatchStore();
  const state = useStateStore();

  const onChange = ({window}) => {
    dispatch({
      type: 'resize',
      payload: {
        width: window.width,
        height: window.height,
      },
    });
  };

  React.useEffect(() => {
    Dimensions.addEventListener('change', onChange);

    return () => {
      Dimensions.removeEventListener('change', onChange);
    };
  }, []);

  React.useEffect(() => {
    fetchHomeData();

    if (Platform.OS === 'ios') {
      StatusBarManager.getHeight(statusBarHeight => {
        dispatch({
          type: 'statusBar',
          payload: {
            height: statusBarHeight.height,
          },
        });
      });
    } else {
      dispatch({
        type: 'statusBar',
        payload: {
          height: StatusBar.currentHeight,
        },
      });
    }
  }, []);

  function fetchHomeData() {
    setIsLoading(true);

    queryChildrenColumnById({
      cId: homeColumnId,
      level: 5,
    })
      .then(json => {
        const homeData = json.data.children[0];

        console.log(`[Home] fetchHomeData() data: ${JSON.stringify(homeData)}`);

        const carousel = homeData.children
          .find(a => a.columnName === '头部广告位')
          .imgList.map(item => `${serverPath}${item.src}`);

        // 主导航数据
        const mainNav = homeData.children
          .find(a => a.columnName === '子栏目')
          .children.map(item => {
            return {
              icon: `${serverPath}${item.icon.src}`,
              name: item.columnName,
              id: item.id,
            };
          })
          .slice(0, 8);

        // 通知公告
        const notice = homeData.children.find(a => a.columnName === '通知公告');

        setHomeData({
          carousel,
          mainNav,
          notice,
        });
      })
      .catch(error => console.error(error))
      .finally(() => setIsLoading(false));
  }

  function onNavPressedHandler(item) {
    console.log(`[Home] onNavPressedHandler() item: ${JSON.stringify(item)}`);
    if (item.name === '课堂秀') {
      navigation.navigate('MonitorList', {
        id: item.id,
        name: item.name,
      });
      return;
    }
    navigation.navigate('List', {
      id: item.id,
    });
  }

  function renderCarousel() {
    console.log(`[Home] renderCarousel() execute`);
    return (
      <Animated.ScrollView
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        snapToAlignment="center"
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [
            {
              nativeEvent: {
                contentOffset: {x: scrollX},
              },
            },
          ],
          {useNativeDriver: false},
        )}
        style={{
          height: 280,
        }}>
        {homeData?.carousel?.map((image, index) => (
          <View key={`carousel-${index}`} style={{alignItems: 'center'}}>
            <Image
              source={{uri: image}}
              resizeMode="cover"
              style={{
                width: state?.window?.width,
                height: 280,
              }}
            />
          </View>
        ))}
      </Animated.ScrollView>
    );
  }

  function renderCarouselDots() {
    const dotPosition = Animated.divide(scrollX, state?.window?.width);

    return (
      <View
        style={{
          height: 30,
          position: 'absolute',
          top: -30,
          left: 0,
          right: 0,
          justifyContent: 'center',
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            height: SIZES.padding,
          }}>
          {homeData?.carousel?.map((item, index) => {
            const opacity = dotPosition.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            const dotSize = dotPosition.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [SIZES.base * 0.8, 10, SIZES.base * 0.8],
              extrapolate: 'clamp',
            });
            const dotColor = dotPosition.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [COLORS.darkgray, COLORS.primary, COLORS.darkgray],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={`dot-${index}`}
                opacity={opacity}
                style={{
                  width: dotSize,
                  height: dotSize,
                  backgroundColor: dotColor,
                  marginHorizontal: 6,
                  borderRadius: SIZES.radius,
                }}
              />
            );
          })}
        </View>
      </View>
    );
  }

  function renderMainNav() {
    const mainNavItemStyle = {
      ...styles.mainNavItem,
      width: (state?.window?.width - SIZES.padding * 4) / mainNavCols,
    };
    const renderItem = ({item}) => {
      return (
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            ...mainNavItemStyle,
          }}
          onPress={() => onNavPressedHandler(item)}>
          <View>
            <Image
              source={{uri: item.icon}}
              resizeMode="contain"
              style={{
                width: 80,
                height: 80,
              }}
            />
          </View>
          <Text>{item.name}</Text>
        </TouchableOpacity>
      );
    };
    return (
      <View
        style={{
          position: 'relative',
          top: -20,
          marginHorizontal: SIZES.padding,
          backgroundColor: COLORS.white,
          borderTopLeftRadius: SIZES.radius,
          borderTopRightRadius: SIZES.radius,
          paddingHorizontal: SIZES.padding,
          paddingTop: SIZES.padding * 2,
          paddingBottom: SIZES.padding,
        }}>
        {renderCarouselDots()}
        <FlatList
          data={homeData?.mainNav}
          keyExtractor={item => item.id}
          numColumns={mainNavCols}
          columnWrapperStyle={mainNavItemStyle}
          renderItem={renderItem}
          horizontal={false}
        />
      </View>
    );
  }

  function renderHeader() {
    const opacity = scrollY.interpolate({
      inputRange: [100, 200],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <Animated.View
        style={{
          width: '100%',
          height: 50 + state?.statusBar?.height,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          top: 0,
          backgroundColor: COLORS.primary,
          zIndex: 10,
          opacity: opacity,
          paddingTop: state?.statusBar?.height,
        }}>
        <Text style={{...FONTS.h2, color: COLORS.white}}>阳光宝贝幼儿园</Text>
      </Animated.View>
    );
  }

  function renderArticleList() {
    const renderListHeaderComponent = () => {
      return (
        <>
          {renderCarousel()}
          {renderMainNav()}
        </>
      );
    };

    console.log(
      `[Home] renderArticleList() notice: ${JSON.stringify(homeData?.notice)}`,
    );

    return (
      <ListComponent
        id={homeData?.notice?.id}
        renderListHeaderComponent={renderListHeaderComponent}
        scrollY={scrollY}
        navigation={navigation}
      />
    );
  }

  console.log(`[Home] render() execute`);
  console.log(`[Home] render() isLoading: ${isLoading}`);
  console.log(`[Home] window width: ${state.window.width}`);
  console.log(`[Home] status bar height: ${state.statusBar.height}`);
  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        translucent={true}
        backgroundColor="transparent"
      />
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <View>
          {renderHeader()}
          {renderArticleList()}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
  },
  mainNavItem: {
    marginBottom: SIZES.padding,
  },
});
