import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Toast from 'react-native-toast-message';
import {getUniqueId} from 'react-native-device-info';

import {SafeAreaView} from '../components';
import {COLORS, icons, FONTS, SIZES} from '../constants';
import {useStateStore, useDispatchStore} from '../store';
import {login} from '../api';

export default function Login({navigation}) {
  const state = useStateStore();
  const dispatch = useDispatchStore();

  const [account, setAccount] = React.useState('evm001');
  const [password, setPassword] = React.useState('123456');

  const onLogin = () => {
    if (account && password) {
      login({
        logid: account,
        password: password,
        deviceid: getUniqueId(),
      })
        .then(json => {
          if (json.success) {
            dispatch({
              type: 'user',
              payload: {
                name: json.data.name,
                certificateId: json.data.certificateid,
                mobile: json.data.mobile,
                email: json.data.email,
                address: json.data.address,
                logId: json.data.logid,
              },
            });

            navigation.goBack();
          } else {
            showToast(json.message);
          }
        })
        .catch(error => console.error(error))
        .finally(() => {});
    }
  };

  function showToast(message) {
    Toast.show({
      type: 'error',
      position: 'bottom',
      text1: message,
    });
  }

  function renderHeader() {
    return (
      <View
        style={{
          flexDirection: 'row',
          height: 50,
          backgroundColor: COLORS.primary,
        }}>
        <TouchableOpacity
          style={{
            width: 50,
          }}
        />
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
          <Text style={{...FONTS.h2, color: COLORS.white}}>用户登录</Text>
        </View>
        <TouchableOpacity
          style={{
            width: 50,
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={() => navigation.goBack()}>
          <Image
            source={icons.close}
            resizeMode="contain"
            style={{
              width: 30,
              height: 30,
            }}
          />
        </TouchableOpacity>
      </View>
    );
  }

  function renderForm() {
    return (
      <View>
        <View
          style={{
            marginVertical: SIZES.padding * 4,
            marginHorizontal: SIZES.padding * 2,
            backgroundColor: COLORS.white,
            paddingHorizontal: SIZES.padding,
            paddingTop: SIZES.padding,
            borderRadius: 5,
            ...styles.viewShadow,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <View
              style={{
                position: 'absolute',
                paddingLeft: SIZES.base,
              }}>
              <MaterialIcons
                name="person-outline"
                size={24}
                color={COLORS.secondary}
              />
            </View>
            <TextInput
              style={styles.input}
              onChangeText={setAccount}
              value={account}
              placeholder="账号、邮箱或手机"
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginTop: SIZES.padding,
            }}>
            <View
              style={{
                position: 'absolute',
                paddingLeft: SIZES.base,
                justifyContent: 'center',
              }}>
              <MaterialIcons
                name="lock-outline"
                size={24}
                color={COLORS.secondary}
              />
            </View>
            <TextInput
              style={{
                ...styles.input,
                borderBottomWidth: 0,
              }}
              onChangeText={setPassword}
              value={password}
              secureTextEntry={true}
              placeholder="密码"
            />
          </View>
        </View>
        <View
          style={{
            paddingHorizontal: SIZES.padding * 2,
          }}>
          <TouchableOpacity
            style={{
              width: state.window.width - SIZES.padding * 4,
              height: 50,
              backgroundColor: COLORS.primary,
              borderRadius: SIZES.radius,
              justifyContent: 'center',
              alignItems: 'center',
              ...styles.viewShadow,
            }}
            onPress={onLogin}>
            <Text style={{...FONTS.h4, color: COLORS.white}}>登录</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.lightGray2,
        }}>
        {renderHeader()}
        {renderForm()}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  input: {
    paddingLeft: 40,
    height: 40,
    borderBottomColor: COLORS.secondary,
    borderBottomWidth: 1,
    flex: 1,
  },
  viewShadow: {
    //该属性只支持>=android 5.0
    elevation: 5,
    shadowColor: COLORS.darkgray,
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 1,
    shadowRadius: 5,
  },
});
