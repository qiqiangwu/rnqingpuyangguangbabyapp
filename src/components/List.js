import React from 'react';
import {
  View,
  Text,
  Animated,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';

import {getCMSarticleByCId, serverPath} from '../api';
import {SIZES, FONTS, COLORS} from '../constants';
import {useStateStore} from '../store';

export default function List({
  id,
  renderListHeaderComponent,
  scrollY,
  navigation,
}) {
  const state = useStateStore();

  const refreshSuccessHeight = React.useRef(new Animated.Value(50)).current;
  const [columnId, setColumnId] = React.useState(null);

  const [isArticleListLoading, setIsArticleListLoading] = React.useState(false);
  const [articleList, setArticleList] = React.useState([]);
  const [isArticleListRefreshing, setIsArticleListRefreshing] =
    React.useState(false);
  const [articleListError, setArticleListError] = React.useState(null);
  const [page, setPage] = React.useState(1);
  const [isLoadArticleListComplete, setIsLoadArticleListComplete] =
    React.useState(false);
  const [showRefreshSuccess, setShowRefreshSuccess] = React.useState(false);

  React.useEffect(() => {
    console.log(`[ListComponent] column id: ${id}`);

    setColumnId(id);
  }, [id]);

  React.useEffect(() => {
    if (columnId && articleList.length === 0) {
      fetchArticleList(1);
    }
  }, [columnId, articleList]);

  React.useEffect(() => {
    if (isArticleListRefreshing && articleList.length === 0) {
      fetchArticleList(1);
    }
  }, [isArticleListRefreshing, articleList]);

  React.useEffect(() => {
    if (showRefreshSuccess) {
      refreshSuccessHeight.setValue(50);
      Animated.timing(refreshSuccessHeight, {
        delay: 1000,
        toValue: 0,
        duration: 500,
        useNativeDriver: false,
      }).start(() => {
        setShowRefreshSuccess(false);
      });
    }
  }, [showRefreshSuccess]);

  function fetchArticleList(currentPage) {
    console.log(`[ListComponent] fetchArticleList() start`);
    console.log(`[ListComponent] fetchArticleList() columnId: ${columnId}`);
    console.log(`currentPage: ${currentPage}`);

    if (!isArticleListRefreshing) {
      setIsArticleListLoading(true);
    }

    setPage(currentPage);

    getCMSarticleByCId({
      cId: columnId,
      currentPage,
      pageSize: 10,
    })
      .then(json => {
        const list = json.data.content.map(item => {
          return {
            id: item.id,
            image: `${serverPath}${item.articleImage}`,
            title: item.text,
            abstract: item.searchtext,
            date:
              item.fupdatetime === 'null' ? item.faddtime : item.fupdatetime,
          };
        });

        if (Array.isArray(list) && list.length) {
          setArticleList(articleList.concat(list));
        } else {
          setIsLoadArticleListComplete(true);
        }
      })
      .catch(error => {
        console.error(error);
        setArticleListError(error.message);
      })
      .finally(() => {
        if (isArticleListRefreshing) {
          setIsArticleListRefreshing(false);
          setShowRefreshSuccess(true);
        } else {
          setIsArticleListLoading(false);
        }
      });
  }

  const renderItem = ({item}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('Detail', {
            id: item.id,
          });
        }}>
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: SIZES.padding * 2,
            paddingVertical: SIZES.padding,
            justifyContent: 'space-between',
          }}>
          <View style={{flex: 1}}>
            <Text style={{...FONTS.h2, paddingRight: SIZES.padding}}>
              {item.title}
            </Text>
            <Text
              style={{
                ...FONTS.body3,
                color: COLORS.darkgray,
                marginTop: SIZES.padding * 2,
              }}>
              {item.date}
            </Text>
          </View>
          <Image
            source={{uri: item.image}}
            resizeMode="cover"
            style={{
              width: 120,
              height: 80,
              borderRadius: 4,
            }}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: state?.window?.width - SIZES.padding * 2,
          backgroundColor: COLORS.darkgray,
          opacity: 0.2,
          margin: SIZES.padding,
        }}
      />
    );
  };

  const renderFooter = () => {
    if (!isArticleListLoading && !isLoadArticleListComplete) {
      return null;
    }
    if (isLoadArticleListComplete) {
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

  const handleLoadMore = () => {
    console.log(`handleLoadMore()`);
    if (isLoadArticleListComplete) {
      return;
    }
    if (!isArticleListLoading) {
      const newPage = page + 1;
      fetchArticleList(newPage);
    }
  };

  const renderRefreshSuccess = () => {
    return (
      <Animated.View
        style={{
          alignItems: 'center',
          justifyContent: 'center',
          height: refreshSuccessHeight,
        }}>
        <View
          style={{
            padding: SIZES.padding,
            borderRadius: SIZES.radius,
            backgroundColor: COLORS.lightGray,
            opacity: 0.5,
          }}>
          <Text>为你刷新成功</Text>
        </View>
      </Animated.View>
    );
  };

  function renderListHeader() {
    console.log(`[List] renderListHeader() execute`);
    return (
      <>
        {showRefreshSuccess && renderRefreshSuccess()}
        {renderListHeaderComponent && renderListHeaderComponent()}
      </>
    );
  }

  if (isArticleListLoading && page === 1) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <Animated.FlatList
      data={articleList}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      ItemSeparatorComponent={renderSeparator}
      ListHeaderComponent={renderListHeader()}
      ListFooterComponent={renderFooter()}
      onEndReachedThreshold={0.4}
      onEndReached={handleLoadMore}
      onScroll={Animated.event(
        [
          {
            nativeEvent: {contentOffset: {y: scrollY}},
          },
        ],
        {useNativeDriver: false},
      )}
      refreshing={isArticleListRefreshing}
      onRefresh={() => {
        setArticleList([]);
        setIsArticleListRefreshing(true);
        setIsLoadArticleListComplete(false);
      }}
    />
  );
}
