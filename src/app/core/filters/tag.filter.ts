export function filterByTags() {
    return function (items, tags)
    {
        if ( items.length === 0 || tags.length === 0 )
        {
            return items;
        }

        let filtered = [];

        items.forEach(function (item)
        {
            let match = tags.every(function (tag)
            {
                let tagExists = false;

                item.tags.forEach(function (itemTag)
                {
                    if ( itemTag.name === tag.name )
                    {
                        tagExists = true;
                        return;
                    }
                });

                return tagExists;
            });

            if ( match )
            {
                filtered.push(item);
            }
        });

        return filtered;
    };
}

export function filterSingleByTags() {
    return function (itemTags, tags)
    {
        if ( itemTags.length === 0 || tags.length === 0 )
        {
            return;
        }

        if ( itemTags.length < tags.length )
        {
            return [];
        }

        let filtered = [];

        let match = tags.every(function (tag)
        {
            let tagExists = false;

            itemTags.forEach(function (itemTag)
            {
                if ( itemTag.name === tag.name )
                {
                    tagExists = true;
                    return;
                }
            });

            return tagExists;
        });

        if ( match )
        {
            filtered.push(itemTags);
        }

        return filtered;
    };
}