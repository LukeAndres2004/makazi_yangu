/*import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

// ---- Reusable Tab Icon Component ----
const TabIcon = ({ name, focused, size }: { name: any, focused: boolean, size: number }) => (
  <View style={{
    backgroundColor: focused ? '#0d2b1f' : 'transparent',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Ionicons
      name={name}
      size={size}
      color={focused ? '#fff' : '#999'}
    />
  </View>
);

// ---- Tab Layout ----
export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#fff',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
            borderTopWidth: 0,
            elevation: 10,
          },
        }}
      >

        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ focused, size }) => (
              <TabIcon
                name={focused ? 'home' : 'home-outline'}
                focused={focused}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ focused, size }) => (
              <TabIcon
                name={focused ? 'search' : 'search-outline'}
                focused={focused}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarIcon: ({ focused, size }) => (
              <TabIcon
                name={focused ? 'bookmark' : 'bookmark-outline'}
                focused={focused}
                size={size}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused, size }) => (
              <TabIcon
                name={focused ? 'person' : 'person-outline'}
                focused={focused}
                size={size}
              />
            ),
          }}
        />

      </Tabs>
    </SafeAreaProvider>
  );
} */
/*
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

const TabIcon = ({ name, focused, size }: { name: any, focused: boolean, size: number }) => (
  <View style={{
    backgroundColor: focused ? '#76ab99' : 'transparent',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
  }}>
    <Ionicons
      name={name}
      size={24}
      color={focused ? '#fff' : '#ffffff'}
    />
  </View>
);

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 65,
            paddingBottom: 10,
            paddingTop: 5,
            borderTopWidth: 0,
            elevation: 10,
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused, size }) => (
              <TabIcon
                name={focused ? 'home' : 'home-outline'}
                focused={focused}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ focused, size }) => (
              <TabIcon
                name={focused ? 'search' : 'search-outline'}
                focused={focused}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            tabBarIcon: ({ focused, size }) => (
              <TabIcon
                name={focused ? 'bookmark' : 'bookmark-outline'}
                focused={focused}
                size={size}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused, size }) => (
              <TabIcon
                name={focused ? 'person' : 'person-outline'}
                focused={focused}
                size={size}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}*/
/*
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 65,
            borderTopWidth: 0,
            elevation: 10,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="home-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="search-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="bookmark-outline" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}*/
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function TabLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarInactiveTintColor: '#333',
          tabBarActiveTintColor: '#447d58',
          tabBarStyle: {
            backgroundColor: '#fff',
            height: 65,
            borderTopWidth: 0,
            elevation: 10,
          },
          tabBarItemStyle: {
            borderRadius: 20,
            margin: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={24}
                color={focused ? '#fff' : '#333'}
              />
            ),
            tabBarItemStyle: {
              backgroundColor: undefined,
              borderRadius: 20,
              margin: 8,
            },
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'search' : 'search-outline'}
                size={24}
                color={focused ? '#fff' : '#333'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'bookmark' : 'bookmark-outline'}
                size={24}
                color={focused ? '#fff' : '#333'}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name={focused ? 'person' : 'person-outline'}
                size={24}
                color={focused ? '#fff' : '#333'}
              />
            ),
          }}
        />
      </Tabs>
    </SafeAreaProvider>
  );
}