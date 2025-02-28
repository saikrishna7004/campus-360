import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { FontAwesome } from '@expo/vector-icons'

import Canteen from './canteen'
import Library from './library'
import Stationary from './stationary'
import Office from './office'

const Tab = createBottomTabNavigator()

export default function TabsLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Canteen"
        component={Canteen}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="cutlery" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Library"
        component={Library}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="book" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Stationary"
        component={Stationary}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="pencil" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Office"
        component={Office}
        options={{
          tabBarIcon: ({ color, size }) => <FontAwesome name="briefcase" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  )
}
