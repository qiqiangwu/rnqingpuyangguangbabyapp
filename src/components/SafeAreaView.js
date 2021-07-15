import React from 'react';
import {SafeAreaView as NativeSafeAreaView,View} from 'react-native';
import {isIphoneX} from 'react-native-iphone-x-helper';

import {useStateStore} from '../store';
import {COLORS} from '../constants';

export default function SafeAreaView({children, style}) {
  const state = useStateStore();
  return (
    <NativeSafeAreaView style={{...style, paddingTop: state.statusBar.height}}>
      {children}
      {isIphoneX() && (
        <View
          style={{
            position: 'absolute',
            height: 50,
            bottom: -5,
            left: 0,
            right: 0,
            backgroundColor: COLORS.white,
          }}
        />
      )}
    </NativeSafeAreaView>
  );
}
