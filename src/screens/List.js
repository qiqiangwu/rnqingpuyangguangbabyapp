import React from 'react';
import {View, StyleSheet, Animated} from 'react-native';

import {Header, SafeAreaView} from '../components';
import {COLORS} from '../constants';
import {ListComponent} from '../components';

export default function List({route, navigation}) {
  const scrollY = React.useRef(new Animated.Value(0)).current;

  const [columnId, setColumnId] = React.useState(null);

  React.useEffect(() => {
    const {id} = route.params;
    setColumnId(id);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.lightGray4,
        }}>
        <Header navigation={navigation} />
        {
          <ListComponent
            id={columnId}
            renderListHeaderComponent={null}
            scrollY={scrollY}
            navigation={navigation}
          />
        }
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
