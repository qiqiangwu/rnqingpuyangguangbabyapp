import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
} from 'react-native';
import {TabView, SceneMap} from 'react-native-tab-view';
import ScrollableTabView, {
  ScrollableTabBar,
  DefaultTabBar,
} from 'react-native-scrollable-tab-view';
import LinearGradinet from 'react-native-linear-gradient';
import Video from 'react-native-video';

import {Header, SafeAreaView} from '../components';
import {COLORS, FONTS, SIZES, images} from '../constants';
import {useStateStore} from '../store';
import {getAreaList} from '../api';

export default function MonitorList({navigation, route}) {
  const state = useStateStore();

  const [id, setId] = React.useState(null);
  const [title, setTitle] = React.useState('');

  console.log(`[MonitorList] user: ${JSON.stringify(state.user)}`);

  const [areaData, setAreaData] = React.useState([]);
  const [areaIndex, setAreaIndex] = React.useState(null);
  const [monitorList, setMonitorList] = React.useState({});

  const [isListLoading, setIsListLoading] = React.useState(false);
  const [isLoadListComplete, setIsLoadListComplete] = React.useState(false);

  const [currentGUID, setCurrentGUID] = React.useState(null);

  React.useEffect(() => {
    const {id, name} = route.params;

    setId(id);
    setTitle(name);

    if (!state.user) {
      navigation.navigate('Login');
    }
  }, []);

  React.useEffect(() => {
    if (state.user) {
      fetchAreaList();
    }
  }, [state.user]);

  React.useEffect(() => {
    if (areaIndex >= 0 && areaData[areaIndex]) {
      const areaId = areaData[areaIndex].areaId;
      const monitorListItem = monitorList[areaId];

      if (!monitorListItem) {
        fetchMonitorList(areaId, 1);
      }
    }
  }, [areaIndex]);

  function fetchAreaList() {
    getAreaList({
      caCard: state.user?.logId,
      areaId: '87-3-84part',
      curPage: 1,
      pageSize: 100,
    })
      .then(json => {
        if (json && json.areaData && json.areaData.length) {
          setAreaData(json.areaData);
        }
      })
      .catch(error => console.error(error))
      .finally(() => {});
  }

  function fetchMonitorList(areaId, pageIndex) {
    setIsListLoading(false);

    getAreaList({
      caCard: state.user?.logId,
      areaId: areaId,
      curPage: pageIndex,
      pageSize: 10,
    })
      .then(json => {
        let item = monitorList[areaId];
        if (!item) {
          item = {};
        }
        if (json && json.IPC && json.IPC.length) {
          setMonitorList({
            ...monitorList,
            [areaId]: {
              ...item,
              page: pageIndex,
              data: pageIndex === 1 ? json.IPC : [...item.data, ...json.IPC],
            },
          });
        } else {
          setMonitorList({
            ...monitorList,
            [areaId]: {
              ...item,
              page: pageIndex,
            },
          });
          setIsLoadListComplete(true);
        }
      })
      .catch(error => console.error(error))
      .finally(() => {
        setIsListLoading(false);
      });
  }

  function onChangeTabHandler({i}) {
    setAreaIndex(i);
  }

  function handleLoadMore() {
    if (isLoadListComplete) {
      return;
    }
    if (!isListLoading) {
      const areaId = areaData[areaIndex].areaId;
      const monitorListItem = monitorList[areaId];

      fetchMonitorList(areaId, monitorListItem.page + 1);
    }
  }

  function onItemPressedHandler(item) {
    setCurrentGUID(item.FGUID);
  }

  function renderTabView() {
    if (areaData.length) {
      return (
        <ScrollableTabView
          initialPage={0}
          renderTabBar={() => <ScrollableTabBar />}
          tabBarActiveTextColor={COLORS.primary}
          tabBarUnderlineStyle={{
            height: 2,
            backgroundColor: COLORS.primary,
          }}
          scrollWithoutAnimation={true}
          onChangeTab={onChangeTabHandler}>
          {areaData.map(item => (
            <View key={item.areaId} tabLabel={item.areaName}>
              {renderTabContent(item.areaId)}
            </View>
          ))}
        </ScrollableTabView>
      );
    } else {
      return <ActivityIndicator />;
    }
  }

  function renderItem({item}) {
    return (
      <TouchableOpacity onPress={() => onItemPressedHandler(item)}>
        <View
          style={{
            height: 200,
          }}>
          {item.FGUID === currentGUID && (
            <Video
              source={{
                /* uri: `http://${item.liveIP}:${item.liveRtspPort}/${item.FGUID}`, */
                uri: 'https://media.w3.org/2010/05/sintel/trailer.mp4',
              }}
              resizeMode="contain"
              controls={true}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                zIndex: 100,
              }}
            />
          )}
          <Image
            source={{uri: item.imageUrl}}
            resizeMode="cover"
            style={{
              width: state.window.width,
              height: 200,
            }}
          />
          <LinearGradinet
            start={{x: 0, y: 1}}
            end={{x: 0, y: 0}}
            colors={['rgba(0,0,0,.8)', 'rgba(0,0,0,0)']}
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 60,
            }}
          />
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 40,
              justifyContent: 'center',
              paddingLeft: SIZES.padding,
            }}>
            <Text style={{...FONTS.body2, color: COLORS.white}}>
              {item.FName}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  const renderFooter = () => {
    if (!isListLoading && !isLoadListComplete) {
      return null;
    }
    if (isLoadListComplete) {
      return (
        <View
          style={{
            width: state?.window?.width,
            justifyContent: 'center',
            alignItems: 'center',
            padding: SIZES.padding,
            color: COLORS.darkgray,
            opacity: 0.5,
          }}>
          <Text>没有更多数据</Text>
        </View>
      );
    }
    return <ActivityIndicator />;
  };

  function renderTabContent(areaId) {
    if (monitorList[areaId]) {
      const {data} = monitorList[areaId];
      if (data && data.length) {
        return (
          <FlatList
            data={data}
            keyExtractor={item => item.FGUID}
            renderItem={renderItem}
            ItemSeparatorComponent={() => (
              <View style={{width: state.window.width, height: 20}} />
            )}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={0.4}
            onEndReached={handleLoadMore}
          />
        );
      }
    }

    return <></>;
  }

  function renderLoginTip() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image source={images.authorize} resizeMode="contain" />
        <Text
          style={{
            ...FONTS.body4,
            color: COLORS.darkgray,
            marginTop: SIZES.base,
          }}>
          登录才能观看
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.lightGray4,
        }}>
        <Header navigation={navigation} title={title} />
        {state.user ? renderTabView() : renderLoginTip()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
});
