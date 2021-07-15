import React from 'react';
import {View, TouchableOpacity, Image, Text} from 'react-native';

import {COLORS, FONTS, icons} from '../constants';

export default function Header({navigation, title}) {
  console.log(`[Header] title: ${title}`);

  return (
    <View
      style={{
        height: 50,
        justifyContent: 'center',
        backgroundColor: COLORS.primary,
        flexDirection: 'row',
      }}>
      <TouchableOpacity
        style={{
          width: 50,
          height: 50,
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onPress={() => navigation.goBack()}>
        <Image
          source={icons.back}
          resizeMode="contain"
          style={{
            width: 30,
            height: 30,
          }}
        />
      </TouchableOpacity>
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{...FONTS.h2, color: COLORS.white}}>{title}</Text>
      </View>
      <TouchableOpacity
        style={{
          width: 50,
        }}></TouchableOpacity>
    </View>
  );
}
