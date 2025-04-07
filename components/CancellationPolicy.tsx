import { Text, View } from "react-native"

const CancellationPolicy = () => {
    return (
        <View className='p-4 gap-1'>
            <Text className="tracking-[2px] font-medium text-slate-500">CANCELLATION POLICY</Text>
            <Text className="tracking-wide text-xs text-slate-500">Help us reducing food waste by avoiding cancellations after placing your order. A 50% cancellation fee will be applied.</Text>
        </View>
    )
}

export default CancellationPolicy
