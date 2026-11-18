def average(numbers):
    """Return the arithmetic mean of an iterable of numbers.

    Raises ValueError if the input is empty.
    """
    values = list(numbers)
    if not values:
        raise ValueError("average() requires at least one number")
    return sum(values) / len(values)
