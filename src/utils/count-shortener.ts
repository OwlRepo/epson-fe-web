export default function countShortener(count: string | number) {
    const countNumber = typeof count === 'string' ? parseInt(count, 10) : count;

    if (isNaN(countNumber)) {
        return '0';
    }

    if (countNumber >= 10000) {
        const thousands = Math.floor(countNumber / 1000);
        return `${thousands}K+`;
    }

    return countNumber.toString();
};