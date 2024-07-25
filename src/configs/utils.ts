import { shortString } from "starknet"
import { BigNumber } from "bignumber.js"
import serialize from 'serialize-javascript'

export function isDarkMode(colorscheme: any): boolean {
    return colorscheme === 'dark' ? true : false
}

export function limitChars(str: string, count: number, show_dots: boolean) {
    if (count <= str?.length) {
        return `${str.substring(0, count)} ${show_dots ? '...' : ''}`
    }
    return str
}

export function bigintToShortStr(bigintstr: string) {
    if (!bigintstr) return ""
    const bn = BigNumber(bigintstr)
    if (bn.isNaN()) return bigintstr
    const hex_sentence = `0x` + bn?.toString(16)
    return shortString.decodeShortString(hex_sentence)
}


export function convertToReadableTokens(tokens: any, decimals: number) {
    if (!tokens || !decimals) return ""
    return new BigNumber(tokens).dividedBy(10 ** decimals).toNumber().toFixed(6)
}

export function bigintToLongStrAddress(bigintstr: any) {
    if (bigintstr === "") return "na"
    const bn = BigNumber(bigintstr)
    const hex_sentence = `0x` + bn.toString(16)
    if (shortString.isDecimalString(hex_sentence)) {
        return shortString.decodeShortString(hex_sentence)
    }
    return hex_sentence;
}

export function bnCompare(bn: any, b: any) {
    return BigNumber(bn).toString() === b
}

export function timeStampToDate(timestamp: number) {
    if (!timestamp) return null
    const timestampInMilliseconds = timestamp * 1000;
    const date = new Date(timestampInMilliseconds);
    return date;
}


export function getTwoAddressLetters(address: string) {
    if (!address) return "0x"
    return address?.substring(0, 4).substring(2, 4) ?? "0x"
}

export const encoder = (str: string) => {
    return shortString.encodeShortString(str);
}

export function getRealPrice(val: any) {
    let decimals = BigNumber(val.decimals).toNumber()
    let ts = BigNumber(val.last_updated_timestamp).toNumber()
    let real_price = {
        price: BigNumber(val.price).dividedBy(10 ** decimals).toNumber(),
        last_updated_timestamp: timeStampToDate(ts),
        num_sources_aggregated: BigNumber(val.num_sources_aggregated).toNumber()
    }
    return real_price
}

export function formatNumberInternational(number: number) {
    const DECIMALS = 4
    if (typeof Intl.NumberFormat === 'function') {
        const formatter = new Intl.NumberFormat('en-US', { minimumFractionDigits: DECIMALS, maximumFractionDigits: DECIMALS });
        return formatter.format(number);
    } else {
        return number.toLocaleString('en-US');
    }
}

export const getInterfaceName = (full_intf: string) => {
    const pieces = full_intf.split("::")
    const last = pieces[pieces.length - 1]
    return last
}


export const getLastItemBasedOnSeparator = (str: string, separator: string): string => {

    if (!str) return "";
    if (str.includes("core::array")) {
        return 'array'
    }
    const lastIndex = str.lastIndexOf(separator);
    return lastIndex !== -1 ? str.substring(lastIndex + separator.length) : str;
};

export const getStruct = (str: string, contract: any) => {
    const match = str.match(/core::array::Array::<(.+)>/);
    const arrayType = match ? match[1] : ''
    if (arrayType) {
        if (arrayType === "core::integer::u8" || arrayType === "core::integer::u16" || arrayType === "core::integer::u32" || arrayType === "core::integer::u64" || arrayType === "core::integer::u128" || arrayType === "core::integer::u256") {
            return {
                type: "number",
                isPlain: true
            }
        } else {
            const struct = contract?.structs[arrayType]
            const structObj: any = {
                isPlain: false,
                fields: []
            }
            struct?.members?.map((member: any) => {
                let field = {
                    name: member.name,
                    type: getLastItemBasedOnSeparator(member.type, "::")
                }
                structObj.fields.push(field)
                // structObj.type = getLastItemBasedOnSeparator(member.type, "::")
            })
            return structObj
        }
    }
    return null
}


export function extractTypeFromString(inputString: string) {
    if (!inputString) return null
    // Define a regular expression pattern to match TypeScript type declarations with arrays
    const typeRegex = /Array::<([^>]+)>/;

    // Match the input string against the regular expression
    const match = inputString.match(typeRegex);

    // Check if a match is found
    if (match) {
        // Extract the type from the captured group
        const extractedType = match[1];

        // Split the type by double colons to get individual parts
        const typeParts = extractedType.split('::');

        // Return the last part, which is the desired type
        return typeParts[typeParts.length - 1];
    } else {
        // Return null if no match is found
        return null;
    }
}

// Example usage
// const inputString = 'core::array::Array::<cycle_stark::interfaces::StarkCollective>';
// const extractedType = extractTypeFromString(inputString);

// const getStruct = (abi: any, _struct: any) => {
//     if (!abi || !_struct) return null
//     let _structs = abi?.filter((entry: any) => entry?.name.includes(_struct))
//     if (_structs.length > 0) {
//         return _structs[0]
//     }
//     return null
// }

// let known_outputs = ['u8', 'u32', 'u64', 'u128', 'u256', 'felt252', 'ContractAddress', 'bool']

// function obtainKeyTypeFromStruct(key_name: string, struct_members: any[]) {
//     return getLastItemBasedOnSeparator(struct_members.find(elem => elem.name === key_name)?.type ?? "", "::")
// }

export function JSONSerializer(value: any, _functionInfo?: any, _abi?: any) {
    // try {
    //     let _output = functionInfo?.outputs[0]
    //     let isArrayType = extractTypeFromString(_output?.type)
    //     let output = getLastItemBasedOnSeparator(_output?.type, "::")
    //     let struct: any = null
    //     if (isArrayType && !known_outputs.includes(isArrayType)) {
    //         struct = getStruct(abi, isArrayType)
    //         for (let i = 0; i < value.length; i++) {
    //             const element = value[i];
    //             if (struct && element) {
    //                 Object.keys(element).forEach((key_: any) => {
    //                     const key_type = obtainKeyTypeFromStruct(key_, struct?.members)
    //                     if (key_type === 'u8' || key_type === 'u32' || key_type === 'u64' || key_type === 'u128' || key_type === 'u256') {
    //                         element[key_] = element[key_].toString()
    //                     }
    //                     else if (key_type === 'ContractAddress') {
    //                         element[key_] = bigintToLongStrAddress(element[key_])
    //                     }
    //                     else if (key_type === 'felt252') {
    //                         element[key_] = bigintToShortStr(element[key_])
    //                     }
    //                     else if (key_type === 'bool') {
    //                         element[key_] = element[key_]
    //                     }
    //                     else {
    //                         element[key_] = element?.toString()
    //                     }
    //                 })
    //             }
    //         }
    //         return JSON.stringify(value, null, 4)
    //     }
    //     else if (isArrayType && known_outputs.includes(isArrayType)) {
    //         struct = getStruct(abi, isArrayType)
    //         for (let i = 0; i < value.length; i++) {
    //             if (isArrayType === 'u8' || isArrayType === 'u32' || isArrayType === 'u64' || isArrayType === 'u128' || isArrayType === 'u256') {
    //                 const element = value[i];
    //                 value[i] = element.toString()
    //             }
    //             else if (isArrayType === 'ContractAddress') {
    //                 value[i] = bigintToLongStrAddress(value[i])
    //             }
    //             else if (isArrayType === 'felt252') {
    //                 value[i] = bigintToShortStr(value[i])
    //             }
    //             else if (isArrayType === 'bool') {
    //                 value[i] = value[i]
    //             }
    //             else {
    //                 value[i] = value[i]?.toString()
    //             }
    //         }
    //         return JSON.stringify(value, null, 4)
    //     }
    //     else if (!known_outputs.includes(output)) {
    //         struct = getStruct(abi, output)
    //         if (struct && value) {
    //             Object.keys(value).forEach((key_: any) => {
    //                 const key_type = obtainKeyTypeFromStruct(key_, struct?.members)
    //                 if (key_type === 'u8' || key_type === 'u32' || key_type === 'u64' || key_type === 'u128' || key_type === 'u256') {
    //                     value[key_] = value[key_].toString()
    //                 }
    //                 else if (key_type === 'ContractAddress') {
    //                     value[key_] = bigintToLongStrAddress(value[key_])
    //                 }
    //                 else if (key_type === 'felt252') {
    //                     value[key_] = bigintToShortStr(value[key_])
    //                 }
    //                 else if (key_type === 'bool') {
    //                     value[key_] = value[key_]
    //                 }
    //                 else {
    //                     value[key_] = value?.toString()
    //                 }
    //             })
    //             return JSON.stringify(value, null, 4)
    //         }
    //     }
    //     else {
    //         return JSON.stringify(value, null, 4)
    //     }
    //     return JSON.stringify(value, null, 4)
    // }
    // catch (err: any) {
    //     return {
    //         err: `${err}`,
    //         message: "Could not serialize the data"
    //     }
    // }
    return serialize(value, { space: 4 })
}

// export function JSONSerializer(value) {
//     const replacer = (key, val) => {
//         if (typeof val === 'bigint') {
//             return val.toString();
//         }
//         return val;
//     };

//     return JSON.stringify(value, replacer);
// }

export function loadFuncReturnTypes(functionInfo: any) {
    let output = ''
    if (functionInfo?.outputs?.length === 1) {
        let _output = functionInfo?.outputs[0]
        let isArrayType = extractTypeFromString(_output.type)
        let otype = isArrayType ? `${isArrayType}[]` : getLastItemBasedOnSeparator(_output.type, "::")
        output += `${otype}`
    }
    return output
}

export function bigintToLongStrAddressBasedOnType(bigintstr: any, functionInfo: any) {
    const output = loadFuncReturnTypes(functionInfo)
    if (bigintstr === "") return "na"
    const bn = BigNumber(bigintstr)
    const hex_sentence = `0x` + bn.toString(16)
    if (output === 'ContractAddress') {
        return hex_sentence;
    } else if (output === 'felt252') {
        return shortString.decodeShortString(hex_sentence);
    }
    else {
        return bigintstr.toString()
    }

}
