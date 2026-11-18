import pytest

from average import average


def test_integers():
    assert average([1, 2, 3, 4, 5]) == 3.0


def test_floats():
    assert average([0.1, 0.2, 0.3]) == pytest.approx(0.2)


def test_single_element():
    assert average([7]) == 7.0


def test_negatives():
    assert average([-1, -2, -3]) == -2.0


def test_mixed_signs():
    assert average([-5, 5]) == 0.0


def test_tuple_input():
    assert average((2, 4)) == 3.0


def test_generator_input():
    assert average(x for x in [1, 2, 3]) == 2.0


def test_empty_list_raises():
    with pytest.raises(ValueError):
        average([])


def test_empty_iterator_raises():
    with pytest.raises(ValueError):
        average(iter([]))
