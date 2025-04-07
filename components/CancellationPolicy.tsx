import { Text, View } from "react-native"

const CancellationPolicy = () => {
    return (
        <View className='p-4 gap-1'>
            <Text className="tracking-[2px] font-medium text-slate-500">CANCELLATION POLICY</Text>
            <Text className="tracking-wide text-xs text-slate-500">To fairly compensate our vendors, we ask that you only cancel your order within 30 seconds if necessary. After that, 50% of the total order amount will be charged.</Text>
        </View>
    )
}

export default CancellationPolicy
