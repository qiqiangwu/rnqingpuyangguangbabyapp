import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import HTML from 'react-native-render-html';

import {COLORS, FONTS, SIZES} from '../constants';
import {getArticle, serverPath} from '../api';
import {Header, SafeAreaView} from '../components';

export default function Detail({navigation, route}) {
  const [isLoading, setIsLoading] = React.useState(true);
  const [article, setArticle] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const {id} = route.params;

    getArticle({articleId: id})
      .then(json => {
        const article = json.data[0];
        console.log(`[detail] article: ${JSON.stringify(article)}`);

        let content = `<div class="article-wrap">${article.content}</div>`;
        // 替换图片地址
        content = content.replace(
          /\/EMSP_CMS\/uploadImages/gi,
          `${serverPath}/EMSP_CMS/uploadImages`,
        );
        // 换行
        content = content.replace(/\n/gi, '<br />');
        // 去除style属性
        content = content.replace(/style=\"(.*?)\"/gi, '');

        setArticle({
          title: article.title,
          content: content,
        });
      })
      .catch(error => {
        console.error(error);
        setError(error.message);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const renderContent = () => {
    return (
      <ScrollView
        style={{
          flex: 1,
        }}>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            <View
              style={{
                padding: SIZES.padding * 2,
              }}>
              <Text
                style={{
                  ...FONTS.h1,
                }}>
                {article?.title}
              </Text>
            </View>
            <View
              style={{
                paddingHorizontal: SIZES.padding * 2,
              }}>
              <HTML
                source={{html: article?.content}}
                contentWidth={SIZES.width - SIZES.padding * 4}
                tagsStyles={{
                  p: {fontSize: 24, lineHeight: 24 * 1.5},
                }}
                classesStyles={{
                  'article-wrap': {
                    fontSize: 24,
                    lineHeight: 24 * 1.5,
                  },
                }}
              />
            </View>
          </>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView
      style={{
        ...styles.container
      }}>
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.lightGray2,
        }}>
        <Header navigation={navigation} />
        {renderContent()}
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
